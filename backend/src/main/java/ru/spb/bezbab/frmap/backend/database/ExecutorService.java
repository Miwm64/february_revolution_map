package ru.spb.bezbab.frmap.backend.database;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import ru.spb.bezbab.frmap.backend.entities.Event;
import ru.spb.bezbab.frmap.backend.entities.Point;

import java.security.SecureRandom;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;

@Service
public class ExecutorService {
    DataBase db;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final SecureRandom secureRandom = new SecureRandom();

    public ExecutorService(String url, String user, String password) {
        this.db = new DataBase(url, user, password);
        this.db.connect();
    }

    public ArrayList<Event> getEvents() {
        ArrayList<Event> events = new ArrayList<>();
        try {
            Statement st = db.getStatement();
            ResultSet rs = st.executeQuery("SELECT * FROM events;");

            while (rs.next()) {
                Event event = new Event(
                        rs.getInt("id"),
                        rs.getString("title"),
                        rs.getString("description"),
                        rs.getTimestamp("time").toLocalDateTime(),
                        new Point(
                                rs.getDouble("x"),
                                rs.getDouble("y")
                        ),
                        rs.getObject("next_event", Integer.class),
                        rs.getObject("prev_event", Integer.class)
                );
                events.add(event);
            }
            st.close();
        }
        catch (SQLException e){
            db.connect();
            throw new RuntimeException("Couldn't get events");
        }
        return events;
    }

    public boolean createUser(String username, String password, String token) {
        try (Statement stmt = db.getStatement()) {
            if (!checkToken(token)){
                throw new RuntimeException("Authentication failed");
            }
            String hashedPassword = passwordEncoder.encode(password);

            String sql = "INSERT INTO users (username, password_hash) VALUES ('"
                    + username + "', '" + hashedPassword + "') RETURNING id";
            ResultSet rs = stmt.executeQuery(sql);

            if (rs.next()) {
                rs.getInt("id");
                return true;
            }
            return false;
        } catch (SQLException e) {
            throw new RuntimeException("Couldn't create user");
        }
    }

    public String login(String username, String password){
        try (Statement stmt = db.getStatement()) {
            String sql = "SELECT id, password_hash FROM users WHERE username = '" + username + "'";
            ResultSet rs = stmt.executeQuery(sql);

            if (rs.next()) {
                int userId = rs.getInt("id");
                String storedHash = rs.getString("password_hash");
                if (!passwordEncoder.matches(password, storedHash)) {
                    return null;
                }

                byte[] tokenBytes = new byte[32];
                secureRandom.nextBytes(tokenBytes);
                String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

                Timestamp expiresAt = Timestamp.from(Instant.now().plusSeconds(86400));
                String tokenSql = "INSERT INTO token_user (user_id, token, created_at, expires_at) VALUES ("
                        + userId + ", '" + token + "', now(), '" + expiresAt + "')";
                stmt.executeUpdate(tokenSql);

                return token;
            }
            return null;
        } catch (SQLException e) {
            throw new RuntimeException("Couldn't login");
        }
    }

    public boolean checkToken(String token) {
        try (Statement stmt = db.getStatement()) {
            String sql = "SELECT id, expires_at FROM token_user WHERE token = '" + token + "'";
            ResultSet rs = stmt.executeQuery(sql);
            if (rs.next()){
                LocalDateTime expiraryDate = rs.getTimestamp("expires_at").toLocalDateTime();
                if (expiraryDate.isAfter(LocalDateTime.now())){
                    return true;
                }
            }
            return false;
        }

        catch (Exception e){
            throw new RuntimeException("Couldn't validate token");
        }
    }
}
