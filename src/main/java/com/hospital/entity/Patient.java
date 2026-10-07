package com.hospital.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Patient name cannot be empty")
    @Column(nullable = false, length = 100)
    private String name;

    @NotNull(message = "Age is required")
    @Min(value = 0, message = "Age must be at least 0")
    @Max(value = 120, message = "Age must be at most 120")
    @Column(nullable = false)
    private Integer age;

    @NotBlank(message = "Gender is required")
    @Column(nullable = false, length = 10)
    private String gender;

    @Column(length = 20)
    private String phone;

    @Column(length = 255)
    private String symptoms;

    @NotBlank(message = "Priority is required")
    @Column(nullable = false, length = 20)
    private String priority; // CRITICAL, HIGH, MEDIUM, LOW

    @NotBlank(message = "Required bed type is required")
    @Column(name = "required_bed_type", nullable = false, length = 20)
    private String requiredBedType; // GENERAL, PRIVATE, ICU

    @Column(name = "admission_date")
    private LocalDateTime admissionDate;

    @Column(nullable = false, length = 20)
    private String status = "WAITING"; // WAITING, ADMITTED, DISCHARGED

    public Patient() {
        this.admissionDate = LocalDateTime.now();
    }

    public Patient(String name, Integer age, String gender, String phone, String symptoms, String priority, String requiredBedType) {
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.phone = phone;
        this.symptoms = symptoms;
        this.priority = priority;
        this.requiredBedType = requiredBedType;
        this.admissionDate = LocalDateTime.now();
        this.status = "WAITING";
    }

    @PrePersist
    protected void onCreate() {
        if (this.admissionDate == null) {
            this.admissionDate = LocalDateTime.now();
        }
        if (this.status == null || this.status.isBlank()) {
            this.status = "WAITING";
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getRequiredBedType() {
        return requiredBedType;
    }

    public void setRequiredBedType(String requiredBedType) {
        this.requiredBedType = requiredBedType;
    }

    public LocalDateTime getAdmissionDate() {
        return admissionDate;
    }

    public void setAdmissionDate(LocalDateTime admissionDate) {
        this.admissionDate = admissionDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
