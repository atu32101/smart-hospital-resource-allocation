package com.hospital;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HospitalApplication {

    public static void main(String[] args) {
        SpringApplication.run(HospitalApplication.class, args);
        System.out.println("==================================================================");
        System.out.println(" Smart Hospital Resource Allocation System started successfully! ");
        System.out.println(" Web Portal: http://localhost:8080                                ");
        System.out.println(" Login: admin / admin123                                         ");
        System.out.println("==================================================================");
    }
}
