package com.property.propertymanagement.controller;

import com.property.propertymanagement.model.Property;
import com.property.propertymanagement.model.User;
import com.property.propertymanagement.repository.PropertyRepository;
import com.property.propertymanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @GetMapping("/dashboard-stats")
    public ResponseEntity<?> getDashboardStats(Authentication authentication) {
        try {
            // Get all users
            List<User> users = userRepository.findAll();
            
            // Count users by role
            long buyerCount = users.stream().filter(u -> "ROLE_BUYER".equals(u.getRole())).count();
            long sellerCount = users.stream().filter(u -> "ROLE_SELLER".equals(u.getRole())).count();
            long employeeCount = users.stream().filter(u -> "ROLE_EMPLOYEE".equals(u.getRole())).count();

            // Get all properties
            List<Property> properties = propertyRepository.findAll();
            
            // Count properties by status
            long availableCount = properties.stream().filter(p -> "available".equalsIgnoreCase(p.getStatus())).count();
            long pendingCount = properties.stream().filter(p -> "pending".equalsIgnoreCase(p.getStatus())).count();
            long soldCount = properties.stream().filter(p -> "sold".equalsIgnoreCase(p.getStatus())).count();

            // Get recent properties (last 5)
            List<Property> recentProperties = properties.stream()
                .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
                .limit(5)
                .collect(Collectors.toList());

            // Build response
            Map<String, Object> response = new HashMap<>();
            
            // Total counts
            Map<String, Object> totalCounts = new HashMap<>();
            totalCounts.put("buyers", buyerCount);
            totalCounts.put("sellers", sellerCount);
            totalCounts.put("employees", employeeCount);
            totalCounts.put("properties", properties.size());
            response.put("totalCounts", totalCounts);

            // Employee stats
            Map<String, Object> employeeStats = new HashMap<>();
            employeeStats.put("total", employeeCount);
            employeeStats.put("active", employeeCount); // Assuming all employees are active
            employeeStats.put("inactive", 0);
            response.put("employeeStats", employeeStats);

            // Property status
            Map<String, Object> propertyStatus = new HashMap<>();
            propertyStatus.put("available", availableCount);
            propertyStatus.put("pending", pendingCount);
            propertyStatus.put("sold", soldCount);
            response.put("propertyStatus", propertyStatus);

            // Recent properties
            response.put("recentProperties", recentProperties);
            
            // Users list
            response.put("users", users);
            
            // Properties list
            response.put("properties", properties);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
} 