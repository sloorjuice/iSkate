//
//  Constants.swift
//  iSkate
//
//  Created by Anthony Reynolds on 6/11/26.
//

import Foundation

struct Constants {
    static let trickListString = "Trick List"
    static let profileString = "Profile"
    static let settingsString = "Settings"
    
    static let trickListIconString = "skateboard"
    static let profileIconString = "person.crop.circle"
    static let settingsIconString = "gear"
    
    static let testTrick = Trick(id: 0, name: "Ollie", difficulty: "Beginner", category: "Pop", summary: "The foundational trick of skateboarding. The rider pops the tail of the board while sliding their front foot up to jump into the air with the board.", resources: ["https://www.skateboardhere.com/skateboard-ollie.html"], tips: ["Learn to properly pop your board. Stand on the ground in front of your board and use your backfoot to practice popping your board into the air.", "If your ollies rocket into the air, it's caused from not properly jumping and bringing your backfoot up.", "The ollie is one continuous motion of popping the board, jumping into the air, lyfting your backfoot to level out the board, then landing."],isCompleted: false)
    static let testVideoIds = ["JNmUK9fvrAs", "QkeOAcj8Y5k", "KJnZvKwgZaA"]
}
