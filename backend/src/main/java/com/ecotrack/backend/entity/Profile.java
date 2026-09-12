package com.ecotrack.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "profiles")
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 255)
    private String profilePictureUrl;

    @Column(length = 255)
    private String location;

    @Column(length = 1000)
    private String sustainabilityPreferences;

    @Column(length = 1000)
    private String environmentalInterests;

    @Column(length = 1000)
    private String goalPreferences;

    @Column(length = 1000)
    private String lifestyleConfiguration;

    public Profile() {
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getSustainabilityPreferences() {
        return sustainabilityPreferences;
    }

    public void setSustainabilityPreferences(String sustainabilityPreferences) {
        this.sustainabilityPreferences = sustainabilityPreferences;
    }

    public String getEnvironmentalInterests() {
        return environmentalInterests;
    }

    public void setEnvironmentalInterests(String environmentalInterests) {
        this.environmentalInterests = environmentalInterests;
    }

    public String getGoalPreferences() {
        return goalPreferences;
    }

    public void setGoalPreferences(String goalPreferences) {
        this.goalPreferences = goalPreferences;
    }

    public String getLifestyleConfiguration() {
        return lifestyleConfiguration;
    }

    public void setLifestyleConfiguration(String lifestyleConfiguration) {
        this.lifestyleConfiguration = lifestyleConfiguration;
    }
}