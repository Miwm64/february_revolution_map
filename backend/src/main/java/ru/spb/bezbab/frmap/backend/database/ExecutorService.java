package ru.spb.bezbab.frmap.backend.database;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import ru.spb.bezbab.frmap.backend.entities.Event;
import ru.spb.bezbab.frmap.backend.entities.Point;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;

@Service
public class ExecutorService {
    DataBase db;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public ExecutorService(String url, String user, String password){
        db = new DataBase(url, user, password);
        db.connect();
    }

    public ArrayList<Event> getEvents() {
        ArrayList<Event> events = new ArrayList<>();
        try {
            Statement st = db.getStatement();
            st.executeQuery("SELECT * FROM events;");
            ResultSet rs = st.getResultSet();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSSSSS");
            while (rs.next()) {
                Event event = new Event(
                        rs.getInt("id"),
                        rs.getString("title"),
                        rs.getString("description"),
                        LocalDateTime.parse(rs.getString("time"), formatter),
                        new Point(
                                rs.getDouble("x"),
                                rs.getDouble("y")
                        ),
                        rs.getObject("next_event", Integer.class),
                        rs.getObject("prev_event", Integer.class)
                );
                events.add(event);
            }
        }
        catch (Exception e){
            db.connect();
        }
        return events;
    }

    public boolean createUser(String username, String password) {
        try (Statement stmt = db.getStatement()) {
            String hashedPassword = passwordEncoder.encode(password);

            String sql = "INSERT INTO users (username, password) VALUES ('"
                    + username + "', '" + hashedPassword + "') RETURNING id";
            ResultSet rs = stmt.executeQuery(sql);

            if (rs.next()) {
                int userId = rs.getInt("id");
                return true;
            }
            return false;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public String login(String username, String password){
        try (Statement stmt = db.getStatement()) {
            String sql = "SELECT id, password FROM users WHERE username = '" + username + "'";
            ResultSet rs = stmt.executeQuery(sql);

            if (rs.next()) {
                int userId = rs.getInt("id");
                String storedHash = rs.getString("password");

                if (!passwordEncoder.matches(password, storedHash)) {
                    return "Invalid username or password";
                }

                byte[] tokenBytes = new byte[32];
                secureRandom.nextBytes(tokenBytes);
                String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

                // 4. Insert token into token_user table with optional expiration (24h here)
                Timestamp expiresAt = Timestamp.from(Instant.now().plusSeconds(86400));
                String tokenSql = "INSERT INTO token_user (user_id, token, created_at, expires_at) VALUES ("
                        + userId + ", '" + token + "', now(), '" + expiresAt + "')";
                stmt.executeUpdate(tokenSql);

                return "Login successful. Token: " + token;
            }

            return "Invalid username or password";
        } catch (SQLException e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }
}
