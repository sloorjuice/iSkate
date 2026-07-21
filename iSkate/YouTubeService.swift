//
//  YouTubeService.swift
//  iSkate
//
//  Created by Anthony Reynolds on 6/12/26.
//

import Foundation
internal import Combine
import Supabase

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

@MainActor
class YouTubeService: ObservableObject {
    @Published var videoIds: [String] = []
    @Published var isLoading = false
    @Published var errorMessage: String? = nil
    
    func fetchTutorials(for trick: Trick) async {
        let trickId = trick.id
        
        if let cachedIds = trick.cachedVideoIds, !cachedIds.isEmpty,
            let lastUpdated = trick.lastUpdated,
           let expirationDate = Calendar.current.date(byAdding: .day, value: 7, to: lastUpdated),
           expirationDate > Date() {
                self.videoIds = cachedIds
                self.isLoading = false
                return
        }

        self.isLoading = true
        self.errorMessage = nil
        
        let searchQuery = "How to \(trick.name) skateboarding tutorial"
        guard let encodedQuery = searchQuery.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) else {
            self.isLoading = false
            return
        }
        
        let urlString = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=\(encodedQuery)&type=video&key=\(Secrets.youtubeAPIKey)"
        
        guard let url = URL(string: urlString) else {
            self.isLoading = false
            return
        }

        var request = URLRequest(url: url)
        request.setValue("https://your-authorized-domain.com", forHTTPHeaderField: "Referer")

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            let decodedResponse = try JSONDecoder().decode(YouTubeSearchResponse.self, from: data)
            let fetchedIds = decodedResponse.items.compactMap { $0.id.videoId }
            
            self.videoIds = fetchedIds
            
            guard let userId = SupabaseManager.client.auth.currentSession?.user.id else {
                self.isLoading = false
                return
            }
            
            let existingRecords: [RemoteTrickProgress] = try await SupabaseManager.client
                .from("user_trick_progress")
                .select()
                .eq("user_id", value: userId.uuidString)
                .eq("trick_id", value: trickId)
                .execute()
                .value
            
            let existingId = existingRecords.first?.id
            
            let updatePayload = RemoteTrickProgress(
                id: existingId,
                userId: userId,
                trickId: trickId,
                isCompleted: trick.isCompleted,
                cachedVideoIds: fetchedIds,
                lastUpdated: Date()
            )
            
            try await SupabaseManager.client
                .from("user_trick_progress")
                .upsert(updatePayload)
                .execute()
            
            self.isLoading = false
        } catch {
            self.errorMessage = error.localizedDescription
            self.isLoading = false
        }
    }
}
