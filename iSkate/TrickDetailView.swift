//
//  TrickDetailView.swift
//  iSkate
//
//  Created by Anthony Reynolds on 6/11/26.
//

import SwiftUI

struct TrickDetailView: View {
    let trick: Trick
    
    @StateObject private var youtubeService = YouTubeService()
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading) {
                Text(trick.name)
                    .bold()
                    .font(.title)
                
                HStack {
                    Text(trick.difficulty)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    Text("•").foregroundColor(.secondary)
                    Text(trick.category)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Text(trick.summary)
                    .font(.footnote)
                    .foregroundColor(.secondary)
                    .padding(8)
                
                Divider()
                
                HStack(alignment: .center) {
                    Text("Video Tutorials")
                        .font(.headline)
                        .bold()
                    
                    Spacer()
                    
                    Button(action: {
                        openYouTubeSearch(for: trick.name)
                    }) {
                        HStack(spacing: 4) {
                            Text("See More")
                            Image(systemName: "arrow.up.forward.app")
                        }
                        .font(.subheadline)
                        .fontWeight(.medium)
                    }
                }
                
                if youtubeService.isLoading {
                    HStack {
                        Spacer()
                        ProgressView("Searching tutorials...")
                        Spacer()
                    }
                } else if let error = youtubeService.errorMessage {
                    Text("Error finding tutorials: \(error)")
                        .foregroundColor(.red)
                        .font(.caption)
                } else if youtubeService.videoIds.isEmpty {
                    Text("No Tutorial videos found for this trick.")
                        .font(.footnote)
                        .foregroundColor(.secondary)
                } else {
                    VStack(spacing: 20) {
                        ForEach(youtubeService.videoIds, id: \.self) { videoId in
                            VStack(alignment: .leading, spacing: 8) {
                                YouTubePlayerView(videoId: videoId)
                                    .frame(height: 210)
                                    .cornerRadius(12)
                                    .shadow(color: Color.black.opacity(0.1), radius: 4, x: 0, y: 2)
                            }
                        }
                    }
                }
            }
            .padding(8)
        }
        .task {
            await youtubeService.fetchTutorials(for: trick.name)
        }
    }
    
    // Helper function to build the URL query and escape characters securely
        private func openYouTubeSearch(for trickName: String) {
            let searchQuery = "How to \(trickName) skateboarding tutorial"
            
            // Ensure spaces and special characters are safely formatted for a browser URL string
            guard let encodedQuery = searchQuery.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
                  let url = URL(string: "https://www.youtube.com/results?search_query=\(encodedQuery)") else {
                return
            }
            
            // Hands off execution to the device OS.
            // iOS will automatically open this in the official YouTube App if the user has it installed,
            // otherwise it will fall back seamlessly to Safari.
            UIApplication.shared.open(url)
        }
}

#Preview {
    TrickDetailView(trick: Constants.testTrick)
}
