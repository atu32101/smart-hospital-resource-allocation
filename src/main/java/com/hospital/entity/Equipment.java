package com.hospital.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "equipments")
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Equipment name is required")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Equipment type is required")
    @Column(nullable = false, length = 30)
    private String type; // VENTILATOR, OXYGEN, MONITOR, PUMP

    @Column(name = "location_or_room", length = 50)
    private String locationOrRoom; // e.g. "Storage Room A", "ICU-301"

    @Column(nullable = false, length = 20)
    private String status = "AVAILABLE"; // AVAILABLE, ALLOCATED

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Patient patient;

    @Column(name = "allocation_date")
    private LocalDateTime allocationDate;

    public Equipment() {
    }

    public Equipment(String name, String type, String locationOrRoom) {
        this.name = name;
        this.type = type;
        this.locationOrRoom = locationOrRoom;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getLocationOrRoom() {
        return locationOrRoom;
    }

    public void setLocationOrRoom(String locationOrRoom) {
        this.locationOrRoom = locationOrRoom;
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

    public LocalDateTime getAllocationDate() {
        return allocationDate;
    }

    public void setAllocationDate(LocalDateTime allocationDate) {
        this.allocationDate = allocationDate;
    }
}
