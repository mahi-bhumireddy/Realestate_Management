package com.property.propertymanagement.security;

import com.property.propertymanagement.model.User;
import com.property.propertymanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        logger.info("Attempting to load user by email: {}", email);
        
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> {
                logger.error("User not found with email: {}", email);
                return new UsernameNotFoundException("User not found with email : " + email);
            });

        logger.info("User found with email: {}, role: {}", email, user.getRole());
        return UserPrincipal.create(user);
    }

    @Transactional
    public UserDetails loadUserById(Long id) {
        logger.info("Attempting to load user by id: {}", id);
        
        User user = userRepository.findById(id)
            .orElseThrow(() -> {
                logger.error("User not found with id: {}", id);
                return new UsernameNotFoundException("User not found with id : " + id);
            });

        logger.info("User found with id: {}, email: {}", id, user.getEmail());
        return UserPrincipal.create(user);
    }
} 