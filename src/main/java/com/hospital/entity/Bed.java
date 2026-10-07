package com.hospital.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "beds")
public class Bed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Bed number cannot be empty")
    @Column(name = "bed_number", nullable = false, unique = true, length = 50)
    private String bedNumber;

    @NotBlank(message = "Bed type cannot be empty")
    @Column(name = "bed_type", nullable = false, length = 20)
    private String bedType; // GENERAL, PRIVATE, ICU

    @NotNull(message = "Floor is required")
    @Column(nullable = false)
    private Integer floor;

    @Column(nullable = false, length = 20)
    private String status = "AVAILABLE"; // AVAILABLE, OCCUPIED

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Patient patient;

    public Bed() {
    }

    public Bed(String bedNumber, String bedType, Integer floor) {
        this.bedNumber = bedNumber;
        this.bedType = bedType;
        this.floor = floor;
        this.status = "AVAILABLE";
    }

    @PrePersist
    protected void onCreate() {
        if (this.status == null || this.status.isBlank()) {
            this.status = "AVAILABLE";
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBedNumber() {
        return bedNumber;
    }

    public void setBedNumber(String bedNumber) {
        this.bedNumber = bedNumber;
    }

    public String getBedType() {
        return bedType;
    }

    public void setBedType(String bedType) {
        this.bedType = bedType;
    }

    public Integer getFloor() {
        return floor;
    }

    public void setFloor(Integer floor) {
        this.floor = floor;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }
}
