//
//  AuthViewModel.swift
//  iSkate
//
//  Created by Anthony Reynolds on 7/21/26.
//

import SwiftUI
import Supabase

@Observable
class AuthViewModel {
    var isSignUp: Bool = false
    
    // Inputs
    var email = "" {
        didSet { debounceEmailValidation() }
    }
    var password = "" {
        didSet { debouncePasswordValidation() }
    }
    
    // Validation Feedback Messages
    var emailError: String? = nil
    var passwordError: String? = nil
    var isCheckingEmail = false // Loading indicator for network check
    
    // Overall Form Validity
    var isValid: Bool {
        isEmailValid(email) && emailError == nil && isPasswordValid(password)
    }
    
    // Internal tasks to manage debouncing
    private var emailTask: Task<Void, Never>?
    private var passwordTask: Task<Void, Never>?
    
    // MARK: - Real-time Debounced Validation
    
    private func debounceEmailValidation() {
        emailTask?.cancel() // Cancel previous task on every keystroke
        
        emailTask = Task {
            // wait 0.5 seconds of silence before checking
            try? await Task.sleep(for: .seconds(0.5))
            guard !Task.isCancelled else { return }
            
            let trimmedEmail = email.trimmingCharacters(in: .whitespacesAndNewlines)
            
            if trimmedEmail.isEmpty {
                await MainActor.run {
                    emailError = nil
                    isCheckingEmail = false
                }
                return
            }
            
            guard isEmailValid(trimmedEmail) else {
                await MainActor.run {
                    emailError = "Please enter a valid email address."
                    isCheckingEmail = false
                }
                return
            }
            
            await MainActor.run {
                emailError = nil
                isCheckingEmail = true
            }
            
            var exists: Bool = false
            if isSignUp { exists = await checkEmailInSupabase(trimmedEmail)}
                        
            guard !Task.isCancelled else { return }
            
            await MainActor.run {
                isCheckingEmail = false
                if exists {
                    emailError = "This email is already registered."
                } else {
                    emailError = nil
                }
            }
        }
    }
    
    public func refresh() {
        debouncePasswordValidation()
        debounceEmailValidation()
    }
    
    private func checkEmailInSupabase(_ emailToCheck: String) async -> Bool {
        do {
            // Access static client directly
            let exists: Bool = try await SupabaseManager.client
                .rpc("check_email_exists", params: ["email_input": emailToCheck])
                .execute()
                .value
            
            return exists
        } catch {
            print("Supabase check failed: \(error)")
            return false
        }
    }
    
    private func debouncePasswordValidation() {
        passwordTask?.cancel() // Cancel previous task on every keystroke
        
        passwordTask = Task {
            // wait 0.5 seconds of silence before checking
            try? await Task.sleep(for: .seconds(0.5))
            guard !Task.isCancelled else { return }
            
            if password.isEmpty {
                passwordError = nil
            } else if !isPasswordValid(password) {
                passwordError = "Password must be at least 8 characters long with a Capital Letter, Lowercase Letter, Number and Special Character."
            } else {
                passwordError = nil
            }
        }
    }
    
    // MARK: - Validation Rules
    
    private func isEmailValid(_ email: String) -> Bool {
        let pattern = "^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}$"
        return email.range(of: pattern, options: .regularExpression) != nil
    }
    
    private func isPasswordValid(_ password: String) -> Bool {
        let isPassLongEnough: Bool = password.count >= 8
        let doesPassContainCapital: Bool = password.contains { $0.isUppercase }
        let doesPassContainLowercase: Bool = password.contains { $0.isLowercase }
        let doesPassContainNumber: Bool = password.contains { $0.isNumber }
        var doesPassContainSpecial: Bool = false
        
        let specialCharacterSet = CharacterSet.alphanumerics.inverted
        if password.rangeOfCharacter(from: specialCharacterSet) != nil {
            doesPassContainSpecial = true
        }
        
        if isPassLongEnough && doesPassContainCapital && doesPassContainLowercase && doesPassContainNumber && doesPassContainSpecial {
            return true
        } else {
            return false
        }
    }
}
