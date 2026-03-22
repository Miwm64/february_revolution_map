package ru.spb.bezbab.frmap.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import ru.spb.bezbab.frmap.backend.database.ExecutorService;


@SpringBootApplication
public class Main {
    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
    }
    @Bean
    public ExecutorService executorService() {
        return new ExecutorService(
                System.getenv("PG_URL"),
                System.getenv("PG_USER"),
                System.getenv("PG_PASSWORD")
        );
    }

}