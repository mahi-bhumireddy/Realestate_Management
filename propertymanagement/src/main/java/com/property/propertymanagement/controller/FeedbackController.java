package com.property.propertymanagement.controller;

import com.property.propertymanagement.model.Feedback;
import com.property.propertymanagement.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "http://localhost:3000")
public class FeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @PostMapping
    public ResponseEntity<?> submitFeedback(@RequestBody Map<String, String> feedbackRequest) {
        Feedback feedback = new Feedback(
            feedbackRequest.get("name"),
            feedbackRequest.get("email"),
            feedbackRequest.get("message")
        );

        feedbackRepository.save(feedback);
        return ResponseEntity.ok("Feedback submitted successfully");
    }
} 