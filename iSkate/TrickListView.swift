//
//  TrickListView.swift
//  iSkate
//
//  Created by Anthony Reynolds on 6/11/26.
//

import SwiftUI
import SwiftData

struct TrickListView: View {
    // 1. Fetch our lightweight persistent states
    @Query private var savedProgress: [TrickProgress]
    @Environment(\.modelContext) var modelContext
    @State private var navigationPath = NavigationPath()
    
    // 2. Load the base tricks dynamically from the JSON file on launch
    @State private var baseTricks: [Trick] = loadTricks()
    
    // 3. Combine them so the UI has the fresh JSON info + the user's progress
    var displayTricks: [Trick] {
        baseTricks.map { baseTrick in
            var trick = baseTrick
            if let progress = savedProgress.first(where: { $0.id == baseTrick.id }) {
                trick.isCompleted = progress.isCompleted
                trick.cachedVideoIds = progress.cachedVideoIds
                trick.lastUpdated = progress.lastUpdated
            }
            return trick
        }
    }
    
    var body: some View {
        NavigationStack(path: $navigationPath) {
            VStack {
                List {
                    ForEach(displayTricks) { trick in
                        HStack(alignment: .center, spacing: 16) {
                            
                            // Checkmark Button
                            Button {
                                toggleCompletion(for: trick)
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
            .navigationDestination(for: Trick.self) { trick in
                TrickDetailView(trick: trick)
            }
            .navigationTitle("Trick List")
        }
    }
    
    // Helper function to update or create user progress instances
    private func toggleCompletion(for trick: Trick) {
        if let progress = savedProgress.first(where: { $0.id == trick.id }) {
            progress.isCompleted.toggle()
        } else {
            let newProgress = TrickProgress(id: trick.id, isCompleted: true)
            modelContext.insert(newProgress)
        }
        // SwiftData autosaves automatically
    }
}

#Preview {
    TrickListView()
        .modelContainer(.previewContainer)
}
