package com.hospital.dto;

import com.hospital.entity.Bed;
import com.hospital.entity.Patient;
import java.util.ArrayList;
import java.util.List;

public class RecommendationResponse {
    private boolean found;
    private String message;
    private Patient patient;
    private Bed recommendedBed;
    private int priorityScore;
    private List<String> reasons = new ArrayList<>();

    public RecommendationResponse() {
    }

    public RecommendationResponse(boolean found, String message) {
        this.found = found;
        this.message = message;
    }

    public boolean isFound() {
        return found;
    }

    public void setFound(boolean found) {
        this.found = found;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public Bed getRecommendedBed() {
        return recommendedBed;
    }

    public void setRecommendedBed(Bed recommendedBed) {
        this.recommendedBed = recommendedBed;
    }

    public int getPriorityScore() {
        return priorityScore;
    }

    public void setPriorityScore(int priorityScore) {
        this.priorityScore = priorityScore;
    }

    public List<String> getReasons() {
        return reasons;
    }

    public void setReasons(List<String> reasons) {
        this.reasons = reasons;
    }

    public void addReason(String reason) {
        this.reasons.add(reason);
    }
}
