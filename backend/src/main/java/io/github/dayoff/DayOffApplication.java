package io.github.youco.dayoff;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DayOffApplication {

    public static void main(String[] args) {
        SpringApplication.run(DayOffApplication.class, args);
    }

}

