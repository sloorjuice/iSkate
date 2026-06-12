//
//  Trick.swift
//  iSkate
//
//  Created by Anthony Reynolds on 6/11/26.
//

import SwiftData
import Foundation

@Model
class Trick: Decodable, Identifiable, Hashable {
    @Attribute(.unique) var id: Int
    var name: String
    var difficulty: String
    var category: String
    var summary: String
    var resources: [String]?
    var isCompleted: Bool
    
    var cachedVideoIds: [String]?
    var lastUpdated: Date?
    
    init(id: Int, name: String, difficulty: String, category: String, summary: String, resources: [String]?, isCompleted: Bool) {
        self.id = id
        self.name = name
        self.difficulty = difficulty
        self.category = category
        self.summary = summary
        self.resources = resources
        self.isCompleted = isCompleted
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case difficulty
        case category
        case summary
        case resources
        case isCompleted
    }
    
    required init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decodeIfPresent(Int.self, forKey: .id) ?? 0
        name = try container.decodeIfPresent(String.self, forKey: .name) ?? ""
        difficulty = try container.decodeIfPresent(String.self, forKey: .difficulty) ?? ""
        category = try container.decodeIfPresent(String.self, forKey: .category) ?? ""
        summary = try container.decodeIfPresent(String.self, forKey: .summary) ?? ""
        resources = try container.decodeIfPresent(Array.self, forKey: .resources) ?? nil
        isCompleted = try container.decodeIfPresent(Bool.self, forKey: .isCompleted) ?? false
        
        self.cachedVideoIds = nil
        self.lastUpdated = nil
    }
}
