//
//  TrickListView.swift
//  iSkate
//
//  Created by Anthony Reynolds on 6/11/26.
//

import SwiftUI

struct TrickListView: View {
    @StateObject private var cloudViewModel = CloudTrickViewModel()
    @State private var navigationPath = NavigationPath()
    @State private var baseTricks: [Trick] = loadTricks()
    
    var displayTricks: [Trick] {
        baseTricks.map { baseTrick in
            var trick = baseTrick
            if let cloudProgress = cloudViewModel.progressRecords.first(where: { $0.trickId == baseTrick.id }) {
                trick.isCompleted = cloudProgress.isCompleted
                trick.cachedVideoIds = cloudProgress.cachedVideoIds
                trick.lastUpdated = cloudProgress.lastUpdated
            }
            return trick
        }
    }
    
    var body: some View {
        NavigationStack(path: $navigationPath) {
            VStack {
                if cloudViewModel.isSyncing && cloudViewModel.progressRecords.isEmpty {
                    ProgressView("Syncing...")
                } else {
                    List {
                        ForEach(displayTricks) { trick in
                            HStack(alignment: .center, spacing: 16) {
                                
                                // Checkmark Button
                                Button {
                                    Task {
                                        await cloudViewModel.toggleCloudCompletion(trickId: trick.id)
                                    }
                                } label: {
                                    Image(systemName: trick.isCompleted ? "checkmark.square.fill" : "square")
                                        .foregroundColor(trick.isCompleted ? .green : .gray)
                                        .font(.system(size: 22))
                                }
                                .buttonStyle(.plain)
                                
                                // Trick Information
                                VStack(alignment: .leading, spacing: 4) {
                                    HStack {
                                        Text(trick.name).bold()
                                        Text("•").foregroundColor(.secondary)
                                        Text(trick.difficulty).font(.subheadline).foregroundColor(.secondary)
                                        Text("•").foregroundColor(.secondary)
                                        Text(trick.category).font(.subheadline).foregroundColor(.secondary)
                                    }
                                    
                                    Text(trick.summary)
                                        .font(.footnote)
                                        .foregroundColor(.secondary)
                                        .lineLimit(2)
                                        .truncationMode(.tail)
                                }
                                
                                Button {
                                    navigationPath.append(trick)
                                } label: {
                                    Image(systemName: "chevron.forward")
                                        .foregroundColor(.secondary)
                                        .font(.system(size: 16))
                                        .frame(width: 12)
                                }
                            }
                            .padding(.vertical, 4)
                        }
                    }
                }
            }
            .navigationDestination(for: Trick.self) { trick in
                TrickDetailView(trick: trick)
            }
            .navigationTitle("Trick List")
            .task {
                await cloudViewModel.fetchCloudProgress()
            }
            .refreshable {
                await cloudViewModel.fetchCloudProgress()
            }
        }
    }
}

#Preview {
    TrickListView()
        //.modelContainer(.previewContainer)
}
