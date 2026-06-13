//
//  YouTubeService.swift
//  iSkate
//
//  Created by Anthony Reynolds on 6/12/26.
//

import Foundation
internal import Combine
import SwiftData

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
    
    func fetchTutorials(for trick: Trick, modelContext: ModelContext) async {
        let trickId = trick.id
        
        let fetchDescriptor = FetchDescriptor<TrickProgress>(predicate: #Predicate { $0.id == trickId })
        let existingProgress = try? modelContext.fetch(fetchDescriptor).first

        if let progress = existingProgress,
           let cachedIds = progress.cachedVideoIds, !cachedIds.isEmpty,
           let lastUpdated = progress.lastUpdated,
           let expirationDate = Calendar.current.date(byAdding: .day, value: 7, to: lastUpdated),
           expirationDate > Date() {
               
               await MainActor.run {
                   self.videoIds = cachedIds
                   self.isLoading = false
               }
                return
        }
        
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
            let decodedResponse = try JSONDecoder().decode(YouTubeSearchResponse.self, from: data)
            let fetchedIds = decodedResponse.items.compactMap { $0.id.videoId }
            
            await MainActor.run {
                self.videoIds = fetchedIds
                self.isLoading = false
                
                if let progress = existingProgress {
                    progress.cachedVideoIds = fetchedIds
                    progress.lastUpdated = Date()
                } else {
                    let newProgress = TrickProgress(id: trickId, cachedVideoIds: fetchedIds, lastUpdated: Date())
                    modelContext.insert(newProgress)
                }
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
                self.isLoading = false
            }
        }
    }
}
