package com.helpinghands;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/**
 * HelpingHands — AI-Powered Smart Accident Emergency Response System.
 * Report · Respond · Save Lives.
 *
 * Architecture: React (Vite) -> this Spring Boot REST API -> MySQL,
 * with the API calling the YOLO AI service and Firebase Cloud Messaging.
 */
@SpringBootApplication
@ConfigurationPropertiesScan
public class HelpingHandsApplication {
    public static void main(String[] args) {
        SpringApplication.run(HelpingHandsApplication.class, args);
    }
}
