package com.property.propertymanagement.repository;

import com.property.propertymanagement.model.Property;
import com.property.propertymanagement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findBySeller(User seller);
    List<Property> findByBuyer(User buyer);
    List<Property> findByStatus(String status);
    List<Property> findByType(String type);
    List<Property> findByLocationContainingIgnoreCase(String location);
} 