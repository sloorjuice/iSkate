//
//  TrickDetailView.swift
//  iSkate
//
//  Created by Anthony Reynolds on 6/11/26.
//

import SwiftUI

struct TrickDetailView: View {
    let trick: Trick
    
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
            }
            .padding(8)
        }
    }
}

#Preview {
    TrickDetailView(trick: Constants.testTrick)
}
