package com.property.propertymanagement.controller;

import com.property.propertymanagement.model.User;
import com.property.propertymanagement.repository.UserRepository;
import com.property.propertymanagement.security.JwtTokenProvider;
import com.property.propertymanagement.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> signUpRequest) {
        try {
            logger.debug("Processing signup request for email: {}", signUpRequest.get("email"));

            // Validate required fields
            String name = signUpRequest.get("name");
            String email = signUpRequest.get("email");
            String password = signUpRequest.get("password");
            String role = signUpRequest.get("role");

            // Validate all fields are present and not empty
            if (name == null || email == null || password == null || role == null ||
                name.trim().isEmpty() || email.trim().isEmpty() || password.trim().isEmpty() || role.trim().isEmpty()) {
                logger.error("Signup failed: Missing or empty required fields");
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "All fields are required and cannot be empty!"));
            }

            try {
                // Check if email already exists
                if (userRepository.existsByEmail(email)) {
                    logger.error("Signup failed: Email already exists - {}", email);
                    return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email is already taken!"));
                }

                // Create new user
                User user = new User(
                    email.trim(),
                    passwordEncoder.encode(password),
                    name.trim(),
                    role.trim().toUpperCase()
                );

                // Save user
                User savedUser = userRepository.save(user);
                logger.info("User registered successfully: {}", savedUser.getEmail());

                Map<String, Object> response = new HashMap<>();
                Map<String, Object> userResponse = new HashMap<>();
                
                userResponse.put("id", savedUser.getId());
                userResponse.put("name", savedUser.getName());
                userResponse.put("email", savedUser.getEmail());
                userResponse.put("role", savedUser.getRole().toLowerCase());
                
                response.put("message", "User registered successfully");
                response.put("user", userResponse);
                
                return ResponseEntity.ok(response);
                
            } catch (DataAccessException e) {
                logger.error("Database error during signup", e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Database error occurred. Please try again later."));
            }
        } catch (Exception e) {
            logger.error("Unexpected error during registration", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred. Please try again later."));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");
            
            logger.debug("Login attempt received for email: {}", email);

            // Input validation
            if (email == null || password == null || email.trim().isEmpty() || password.trim().isEmpty()) {
                logger.error("Login failed: Missing or empty email/password");
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email and password are required"));
            }

            try {
                // First check if user exists
                Optional<User> userOptional = userRepository.findByEmail(email);
                if (!userOptional.isPresent()) {
                    logger.error("Login failed: No user found with email: {}", email);
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid email or password"));
                }

                User user = userOptional.get();
                logger.debug("User found in database for email: {}", email);

                try {
                    // Create authentication token and attempt authentication
                    UsernamePasswordAuthenticationToken authToken = 
                        new UsernamePasswordAuthenticationToken(email, password);
                    
                    logger.debug("Attempting authentication for user: {}", email);
                    
                    Authentication authentication = authenticationManager.authenticate(authToken);
                    logger.info("Authentication successful for user: {}", email);

                    try {
                        // Generate JWT Token
                        String jwt = tokenProvider.generateToken(authentication);
                        logger.debug("JWT token generated for user: {}", email);
                        
                        // Get user details
                        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
                        
                        Map<String, Object> response = new HashMap<>();
                        Map<String, Object> userResponse = new HashMap<>();
                        
                        userResponse.put("id", userPrincipal.getId());
                        userResponse.put("name", userPrincipal.getName());
                        userResponse.put("email", userPrincipal.getEmail());
                        userResponse.put("role", userPrincipal.getAuthorities().stream()
                            .findFirst()
                            .map(auth -> auth.getAuthority().replace("ROLE_", "").toLowerCase())
                            .orElse(""));
                        
                        response.put("token", jwt);
                        response.put("user", userResponse);
                        
                        logger.info("Login successful for user: {}", email);
                        return ResponseEntity.ok(response);
                    } catch (Exception e) {
                        logger.error("Error generating JWT token for user: {}", email, e);
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(Map.of("error", "Error generating authentication token"));
                    }
                } catch (BadCredentialsException e) {
                    logger.error("Login failed: Invalid credentials for user: {}", email);
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid email or password"));
                } catch (AuthenticationException e) {
                    logger.error("Authentication failed for user: {}", email, e);
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Authentication failed: " + e.getMessage()));
                }
            } catch (DataAccessException e) {
                logger.error("Database error during login for email: {}", email, e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Database error occurred. Please try again later."));
            }
        } catch (Exception e) {
            logger.error("Unexpected error during login", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "An unexpected error occurred. Please try again later.",
                    "details", e.getMessage(),
                    "type", e.getClass().getName()
                ));
        }
    }
} 