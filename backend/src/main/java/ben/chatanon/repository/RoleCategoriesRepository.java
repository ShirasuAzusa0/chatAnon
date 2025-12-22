package ben.chatanon.repository;

import ben.chatanon.entity.entity_role.RoleCategories;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RoleCategoriesRepository extends JpaRepository<RoleCategories, Long> {
    RoleCategories findByRoleTagName(String roleTagName);

    @Query(value = """
            SELECT rcs.backgroundPrompt
            FROM role_category rc
            JOIN rolecategories rcs ON rc.roleTagId = rcs.roleTagId
            WHERE rc.roleId = :roleId
            """, nativeQuery = true)
    List<String> findBackTagNamesByRoleId(int roleId);
}
