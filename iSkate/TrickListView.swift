//
//  TrickListView.swift
//  iSkate
//
//  Created by Anthony Reynolds on 6/11/26.
//

import SwiftUI
import SwiftData

struct TrickListView: View {
    @Query(sort: \Trick.id) private var tricks: [Trick]
    @Environment(\.modelContext) var modelContext
    @State private var navigationPath = NavigationPath()
    
    var body: some View {
        NavigationStack(path: $navigationPath) {
            VStack {
                List {
                    ForEach(tricks) { trick in
                        HStack(alignment: .center, spacing: 16) {
                            // Checkmark
                            Button {
                                trick.isCompleted.toggle()
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
                                    .lineLimit(2)
                                    .truncationMode(.tail)
                            }
                            
                            Button {
                                navigationPath.append(trick)
                            } label: {
                                Image(systemName: "chevron.forward")
                                    .foregroundColor(.secondary)
                                    .font(.system(size: 16))
                                    .frame(width: 12) // optional: fix width to avoid layout jitter
                                    .alignmentGuide(.firstTextBaseline) { d in d[.firstTextBaseline] } // keeps baseline alignment consistent
                            }
                        }
                        .padding(.vertical, 4) // gives each row a consistent height
                    }
                }
            }
            .navigationDestination(for: Trick.self) { trick in
                TrickDetailView(trick: trick)
            }
        }
    }
}

#Preview {
    TrickListView()
        .modelContainer(.previewContainer)
}
