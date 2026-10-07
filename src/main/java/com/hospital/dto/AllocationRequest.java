package com.hospital.dto;

import jakarta.validation.constraints.NotNull;

public class AllocationRequest {
    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Bed ID is required")
    private Long bedId;

    public AllocationRequest() {
    }

    public AllocationRequest(Long patientId, Long bedId) {
        this.patientId = patientId;
        this.bedId = bedId;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public Long getBedId() {
        return bedId;
    }

    public void setBedId(Long bedId) {
        this.bedId = bedId;
    }
}
