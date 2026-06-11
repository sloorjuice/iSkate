//
//  TrickListView.swift
//  iSkate
//
//  Created by Anthony Reynolds on 6/11/26.
//

import SwiftUI
import SwiftData

struct TrickListView: View {
    // 1. Fetch the data straight out of SwiftData, sorted by ID or Name
    @Query(sort: \Trick.id) private var tricks: [Trick]
    @Environment(\.modelContext) var modelContext
    
    var body: some View {
        VStack {
            List {
                // 2. Iterate directly over the model instances
                ForEach(tricks) { trick in
                    HStack(alignment: .center, spacing: 16) {
                        Button {
                            // 3. Directly toggle the property. SwiftData handles autosaving.
                            trick.isCompleted.toggle()
                        } label: {
                            Image(systemName: trick.isCompleted ? "checkmark.square.fill" : "square")
                                .foregroundColor(trick.isCompleted ? .green : .gray)
                                .font(.system(size: 22))
                        }
                        .buttonStyle(.plain)

                        // --- Trick Information ---
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text(trick.name)
                                    .bold()
                                Text("•")
                                    .foregroundColor(.secondary)
                                Text(trick.difficulty)
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }

                            // NOTE: Your json has "description" but your model uses "summary".
                            // Make sure your JSON keys match your `CodingKeys` in Trick.swift!
                            Text(trick.summary)
                                .font(.footnote)
                                .foregroundColor(.secondary)
                                .lineLimit(2)
                                .truncationMode(.tail)
                        }
                    }
                }
            }
        }
    }
}

#Preview {
    TrickListView()
        .modelContainer(previewModelContainer)
}
