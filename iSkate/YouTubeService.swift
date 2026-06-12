//
//  YouTubeService.swift
//  iSkate
//
//  Created by Anthony Reynolds on 6/12/26.
//

import Foundation
internal import Combine

// Models matching Google's YouTube Data API v3 search endpoint schema
struct YouTubeSearchResponse: Decodable {
    let items: [YouTubeSearchItem]
}

struct YouTubeSearchItem: Decodable {
    let id: YouTubeVideoId
}

struct YouTubeVideoId: Decodable {
    let videoId: String?
}

class YouTubeService: ObservableObject {
    @Published var videoIds: [String] = []
    @Published var isLoading = false
    @Published var errorMessage: String? = nil
    
    func fetchTutorials(for trick: Trick) async {
        // 1. Check if cache exists and is fresh (e.g., less than 7 days old)
        if let cachedIds = trick.cachedVideoIds, !cachedIds.isEmpty,
           let lastUpdated = trick.lastUpdated,
              let expirationDate = Calendar.current.date(byAdding: .day, value: 7, to: lastUpdated),
              expirationDate > Date() {
               
               await MainActor.run {
                   self.videoIds = cachedIds
                   self.isLoading = false
               }
                return // Skip network call completely!
        }
        
        // 2. If no valid cache, prepare for the API call
        await MainActor.run {
            self.isLoading = true
            self.errorMessage = nil
        }
        
        let searchQuery = "How to \(trick.name) skateboarding tutorial"
        let encodedQuery = searchQuery.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        let urlString = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=\(encodedQuery)&type=video&key=\(Secrets.youtubeAPIKey)"
        
        guard let url = URL(string: urlString) else {
            await MainActor.run { self.isLoading = false }
            return
        }

        var request = URLRequest(url: url)
        request.setValue("https://your-authorized-domain.com", forHTTPHeaderField: "Referer")

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode != 200 {
                throw NSError(domain: "YouTubeService", code: httpResponse.statusCode, userInfo: [NSLocalizedDescriptionKey: "Server returned error code \(httpResponse.statusCode)"])
            }
            
            let decodedResponse = try JSONDecoder().decode(YouTubeSearchResponse.self, from: data)
            let fetchedIds = decodedResponse.items.compactMap { $0.id.videoId }
            
            await MainActor.run {
                // 3. Update local state
                self.videoIds = fetchedIds
                self.isLoading = false
                
                // 4. Persist data to SwiftData cache
                trick.cachedVideoIds = fetchedIds
                trick.lastUpdated = Date()
                
                // Saving is handled automatically by SwiftData's implicit context autosave,
                // but if needed, context changes will propagate up smoothly.
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
                self.isLoading = false
            }
        }
    }
}
