package ben.chatanon.repository;

import ben.chatanon.entity.entity_role.Roles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RoleRepository extends JpaRepository<Roles, Long> {
    @Query(value = """
            SELECT *
            FROM roles
            ORDER BY RAND()
            ASC LIMIT :limit
            """, nativeQuery = true)
    List<Roles> findRecommendedList(int limit);

    @Query(value = """
            SELECT *
            FROM roles
            ORDER BY roles.createdAt DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Roles> findNewestList(int limit);

    @Query(value = """
            SELECT roles.*
            FROM roles
            WHERE roles.roleId != 0
                AND (
                   (:tag IS NULL OR :tag = '')
                   OR roles.roleId IN (
                    SELECT role_category.roleId
                    FROM role_category
                    JOIN rolecategories ON role_category.roleTagId = rolecategories.roleTagId
                    WHERE rolecategories.roleTagName = :tag
                   )
                )
                AND (
                    roles.roleName REGEXP :regex
                    OR roles.description REGEXP :regex
                    OR roles.shortInfo REGEXP :regex
                )
            ORDER BY roles.createdAt DESC
            """, nativeQuery = true)
    List<Roles> findListBySearch(String tag, String regex);

    Roles findByRoleId(int roleId);

    @Query(value = """
            SELECT r.*
            FROM roles r
            JOIN role_favorite rf ON r.roleId = rf.roleId
            WHERE rf.userId = :userId
            """, nativeQuery = true)
    List<Roles> findFavoriteListByUserId(int userId);

    @Query(value = """
            SELECT r.*
            FROM roles r
            JOIN role_category rc ON r.roleId = rc.roleId
            JOIN rolecategories rct ON rc.roleTagId = rct.roleTagId
            WHERE rct.roleTagName = :roleTagName
            """, nativeQuery = true)
    List<Roles> findByTagName(String roleTagName);

    @Query(value = """
            SELECT r.*
            FROM roles r
            WHERE r.roleName = :roleName
            """, nativeQuery = true)
    Roles findByRoleName(String roleName);

    @Query(value = """
            SELECT r.*
            FROM roles r
            JOIN role_history rh ON r.roleId = rh.roleId
            WHERE rh.userId = :userId
            """, nativeQuery = true)
    List<Roles> findHistoryList(int userId);
}
