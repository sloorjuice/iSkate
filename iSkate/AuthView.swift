//
//  AuthView.swift
//  iSkate
//
//  Created by Anthony Reynolds on 7/8/26.
//

import SwiftUI

struct AuthView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var viewModel = AuthViewModel()
    @State private var errorMessage: String = ""
    @State private var isLoading: Bool = false
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 4) {
                Text("Welcome to iSkate")
                    .font(.largeTitle)
                    .bold()
                    .padding(.top, 40) // Gives the header a little breathing room from the top
                
                Spacer() // First spacer pushes the form down to the middle
                
                VStack(spacing: 16) { // Added spacing here so fields aren't choked together
                    TextField("Email Address", text: $viewModel.email)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .padding()
                        .background(
                            Rectangle()
                                .stroke(Color.gray.opacity(0.4))
                        )
                    
                    if viewModel.isCheckingEmail {
                        ProgressView()
                            .controlSize(.small)
                    }
                    
                    if let emailError = viewModel.emailError {
                        Text(emailError)
                            .font(.caption)
                            .foregroundStyle(.red)
                    }
                    
                    SecureField("Password", text: $viewModel.password)
                        .textContentType(.password)
                        .padding()
                        .background(
                            Rectangle()
                                .stroke(Color.gray.opacity(0.4))
                        )
                    
                    if let passwordError = viewModel.passwordError {
                        Text(passwordError)
                            .font(.caption)
                            .foregroundStyle(.red)
                    }
                    
                    
                    Button(viewModel.isSignUp ? "Create Account" : "Sign In") {
                        executeAuthAction()
                    }
                    .disabled(isLoading || !viewModel.isValid)
                    .bold()
                    .padding(.top, 10)
                    
                    Button(viewModel.isSignUp ? "Already have an account? Log In" : "Need an account? Sign Up") {
                        viewModel.isSignUp.toggle()
                        viewModel.refresh()
                    }
                    .foregroundStyle(.secondary)
                }
                
                if !errorMessage.isEmpty {
                    Text(errorMessage)
                        .foregroundStyle(.red)
                        .font(.callout)
                        .padding(.top, 10)
                }
                
                Spacer() // Second spacer pushes the form up, locking it in the middle
            }
            .padding(24) // Increased padding a bit for better edge margins on mobile screens
        }
    }
    
    private func executeAuthAction() {
        Task {
            isLoading = true
            errorMessage = ""
            do {
                if viewModel.isSignUp {
                    try await authManager.signUp(email: viewModel.email, password: viewModel.password)
                } else {
                    try await authManager.signIn(email: viewModel.email, password: viewModel.password)
                }
            } catch {
                errorMessage = error.localizedDescription
            }
            isLoading = false
        }
    }
}


#Preview {
    AuthView()
}
