//
//  TrickProgress.swift
//  iSkate
//
//  Created by Anthony Reynolds on 6/12/26.
//

import Foundation
import SwiftData

@Model
class TrickProgress {
    @Attribute(.unique) var id: Int // Maps directly to the Trick ID
    var isCompleted: Bool
    var cachedVideoIds: [String]?
    var lastUpdated: Date?
    
    init(id: Int, isCompleted: Bool = false, cachedVideoIds: [String]? = nil, lastUpdated: Date? = nil) {
        self.id = id
        self.isCompleted = isCompleted
        self.cachedVideoIds = cachedVideoIds
        self.lastUpdated = lastUpdated
    }
}
