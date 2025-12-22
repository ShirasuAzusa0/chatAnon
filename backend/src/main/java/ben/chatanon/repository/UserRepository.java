package ben.chatanon.repository;

import ben.chatanon.entity.Users;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository extends JpaRepository<Users, Integer> {
    Users findByUserId(Integer userId);

    @Query(value = "SELECT * FROM users where email = :email", nativeQuery = true)
    Users findByEmail(@Param("email") String email);

    @Query("SELECT COALESCE(MAX(u.userId), 0) FROM Users u")
    int findMaxId();
}
