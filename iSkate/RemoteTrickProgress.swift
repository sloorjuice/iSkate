//
//  RemoteTrickProgress.swift
//  iSkate
//
//  Created by Anthony Reynolds on 7/8/26.
//

import Foundation

struct RemoteTrickProgress: Codable, Identifiable {
    var id: Int? // Internal database incremental row index
    var userId: UUID
    var trickId: Int
    var isCompleted: Bool
    var cachedVideoIds: [String]?
    var lastUpdated: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case trickId = "trick_id"
        case isCompleted = "is_completed"
        case cachedVideoIds = "cached_video_ids"
        case lastUpdated = "last_updated"
    }
}
