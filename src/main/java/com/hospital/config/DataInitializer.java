package com.hospital.config;

import com.hospital.entity.Bed;
import com.hospital.entity.Patient;
import com.hospital.entity.User;
import com.hospital.repository.BedRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BedRepository bedRepository;
    private final PatientRepository patientRepository;

    @Autowired
    public DataInitializer(UserRepository userRepository,
                           BedRepository bedRepository,
                           PatientRepository patientRepository) {
        this.userRepository = userRepository;
        this.bedRepository = bedRepository;
        this.patientRepository = patientRepository;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedBeds();
        seedPatients();
    }

    private void seedUsers() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User("admin", "admin123", "ROLE_ADMIN");
            userRepository.save(admin);
            System.out.println(">>> Seeded default admin user (admin / admin123)");
        }
    }

    private void seedBeds() {
        if (bedRepository.count() == 0) {
            // 5 General beds (Floor 1)
            for (int i = 1; i <= 5; i++) {
                bedRepository.save(new Bed("B-10" + i, "GENERAL", 1));
            }
            // 5 Private beds (Floor 2)
            for (int i = 1; i <= 5; i++) {
                bedRepository.save(new Bed("P-20" + i, "PRIVATE", 2));
            }
            // 5 ICU beds (Floor 3)
            for (int i = 1; i <= 5; i++) {
                bedRepository.save(new Bed("ICU-30" + i, "ICU", 3));
            }
            System.out.println(">>> Seeded 15 sample beds (5 General, 5 Private, 5 ICU)");
        }
    }

    private void seedPatients() {
        if (patientRepository.count() == 0) {
            List<Patient> samplePatients = List.of(
                    new Patient("Rahul Sharma", 52, "Male", "9876543210", "Severe Respiratory Distress, Low SpO2", "CRITICAL", "ICU"),
                    new Patient("Priya Patel", 38, "Female", "9876543211", "Acute Cardiac Arrest Symptoms", "CRITICAL", "ICU"),
                    new Patient("Amit Kumar", 45, "Male", "9876543212", "High Grade Fever and Typhoid Symptoms", "HIGH", "GENERAL"),
                    new Patient("Sunita Devi", 61, "Female", "9876543213", "Post-Surgery Monitoring Requirement", "HIGH", "PRIVATE"),
                    new Patient("Vikram Singh", 29, "Male", "9876543214", "Compound Leg Fracture", "HIGH", "GENERAL"),
                    new Patient("Rajesh Gupta", 44, "Male", "9876543215", "Uncontrolled Hypertension", "MEDIUM", "GENERAL"),
                    new Patient("Ananya Roy", 34, "Female", "9876543216", "Severe Migraine with Vomiting", "MEDIUM", "PRIVATE"),
                    new Patient("Neha Verma", 22, "Female", "9876543217", "Mild Dehydration, Food Poisoning", "LOW", "GENERAL"),
                    new Patient("Suresh Nair", 50, "Male", "9876543218", "Minor Skin Allergy Observation", "LOW", "PRIVATE"),
                    new Patient("Pooja Mehta", 27, "Female", "9876543219", "General Weakness and Viral Infection", "LOW", "GENERAL")
            );

            patientRepository.saveAll(samplePatients);
            System.out.println(">>> Seeded 10 sample waiting patients across priority tiers");
        }
    }
}
