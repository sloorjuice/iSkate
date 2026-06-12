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
            VStack(alignment: .center, spacing: 8) {
                headerSection
                
                Divider()
                
                tipsSection
                
                resourcesSection
                
                tutorialsSection
            }
            .padding(8)
        }
        .task {
            await youtubeService.fetchTutorials(for: trick)
        }
    }
    
    // MARK: - Subviews
    
    private var headerSection: some View {
        VStack(alignment: .leading) {
            VStack(alignment: .leading) {
                HStack{
                    Text(trick.name)
                        .bold()
                        .font(.title)
                    
                    Spacer()
                }
                    
                    HStack {
                        Text(trick.difficulty)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        Text("•").foregroundColor(.secondary)
                        Text(trick.category)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
            }
            .padding(.top, 8)
            .padding(.leading, 8)
            
            Text(trick.summary)
                .font(.subheadline)
                .padding(.horizontal, 8)
                .padding(.bottom, 8)
        }
        .background(Color(.secondarySystemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
    
    @ViewBuilder
    private var tipsSection: some View {
        if let tips = trick.tips {
            VStack(alignment: .leading) {
                HStack {
                    Text("Tips")
                        .font(.headline)
                        .bold()
                        .padding(.top, 8)
                        .padding(.leading, 8)
                    
                    Spacer()
                }
                
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(tips, id: \.self) { tip in
                        Text("• \(tip)")
                            .font(.footnote)
                            .padding(.horizontal, 8)
                    }
                }
                .padding(.horizontal, 8)
                .padding(.bottom, 8)
            }
            .background(Color(.secondarySystemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 10))
        }
    }
    
    @ViewBuilder
    private var resourcesSection: some View {
        if let resources = trick.resources {
            VStack(alignment: .leading) {
                HStack {
                    Text("Resources")
                        .font(.headline)
                        .bold()
                        .padding(.top, 8)
                        .padding(.leading, 8)
                    
                    Spacer()
                }
                
                VStack(alignment: .leading) {
                    ForEach(resources, id: \.self) { resource in
                        Button(action: {
                            openResourceLink(for: resource)
                        }) {
                            HStack(spacing: 4) {
                                Text("• \(resource)")
                                    .lineLimit(1)
                                    .truncationMode(.tail)
                                Image(systemName: "arrow.up.forward.app")
                            }
                            .font(.footnote)
                            .fontWeight(.medium)
                        }
                    }
                }
                .padding(.horizontal, 8)
                .padding(.bottom, 8)
            }
            .background(Color(.secondarySystemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 10))
        }
    }
    
    private var tutorialsSection: some View {
        VStack {
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
            .padding(8)
            
            tutorialContent
        }
        .background(Color(.secondarySystemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
    
    @ViewBuilder
    private var tutorialContent: some View {
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
                    YouTubePlayerView(videoId: videoId)
                        .aspectRatio(16/9, contentMode: .fit)
                        .frame(maxWidth: 320)
                        .cornerRadius(12)
                        .shadow(color: Color.black.opacity(0.1), radius: 4, x: 0, y: 2)
                        .frame(maxWidth: .infinity, alignment: .center)
                }
            }
        }
    }
    
    // MARK: - Helper Functions
    
    private func openYouTubeSearch(for trickName: String) {
        let searchQuery = "How to \(trickName) skateboarding tutorial"
        
        guard let encodedQuery = searchQuery.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
              let url = URL(string: "https://www.youtube.com/results?search_query=\(encodedQuery)") else {
            return
        }
        
        UIApplication.shared.open(url)
    }
    
    private func openResourceLink(for resource: String) {
        guard let url = URL(string: resource) else { return }
        UIApplication.shared.open(url)
    }
}

#Preview {
    TrickDetailView(trick: Constants.testTrick)
}
