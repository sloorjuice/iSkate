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
    
    func fetchTutorials(for trickName: String) async {
        await MainActor.run {
            self.isLoading = true
            self.errorMessage = nil
        }
        
        let searchQuery = "How to \(trickName) skateboarding tutorial"
        let encodedQuery = searchQuery.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        
        // Option A: Hit your secure production backend proxy (Key stays on your server)
        // let urlString = "\(Secrets.proxyEndpoint)?q=\(encodedQuery)"
        
        // Option B: Querying YouTube directly during local development
        let urlString = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=\(encodedQuery)&type=video&key=\(Secrets.youtubeAPIKey)"
        
        guard let url = URL(string: urlString) else {
            await MainActor.run { self.isLoading = false }
            return
        }

        // 1. Create a URLRequest
        var request = URLRequest(url: url)

        // 2. Set the Referer header to match whatever domain you whitelisted in Google Cloud Console
        request.setValue("https://your-authorized-domain.com", forHTTPHeaderField: "Referer")

        do {
            // 3. Use data(for:) instead of data(from:)
            let (data, response) = try await URLSession.shared.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode != 200 {
                throw NSError(domain: "YouTubeService", code: httpResponse.statusCode, userInfo: [NSLocalizedDescriptionKey: "Server returned error code \(httpResponse.statusCode)"])
            }
            
            let decodedResponse = try JSONDecoder().decode(YouTubeSearchResponse.self, from: data)
            
            // Extract the video IDs, ensuring we filter out any nil values safely
            let fetchedIds = decodedResponse.items.compactMap { $0.id.videoId }
            
            await MainActor.run {
                self.videoIds = fetchedIds
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
                self.isLoading = false
            }
        }
    }
}
