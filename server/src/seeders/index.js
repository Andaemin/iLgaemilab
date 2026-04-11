import sequelize from "../database/connection.js";
import { seedLevelTestQuestions } from "./levelTestSeeder.js";
import { User, Category, Subcategory } from "../models/index.js";
import bcrypt from "bcrypt";

// 기본 카테고리 데이터
const categoriesData = [
    {
        name: "construction",
        nameKo: "건설업",
        nameEn: "Construction",
        nameVi: "Xây dựng",
        description: "건설 현장에서 필요한 한국어",
        icon: "mdi-hammer",
        color: "#FF5722",
        sortOrder: 1,
    },
    {
        name: "manufacturing",
        nameKo: "제조업",
        nameEn: "Manufacturing",
        nameVi: "Sản xuất",
        description: "공장 및 제조 현장에서 사용하는 한국어",
        icon: "mdi-factory",
        color: "#2196F3",
        sortOrder: 2,
    },
    {
        name: "service",
        nameKo: "서비스업",
        nameEn: "Service",
        nameVi: "Dịch vụ",
        description: "서비스업 종사자를 위한 한국어",
        icon: "mdi-account-group",
        color: "#4CAF50",
        sortOrder: 3,
    },
    {
        name: "daily_life",
        nameKo: "일상생활",
        nameEn: "Daily Life",
        nameVi: "Cuộc sống hàng ngày",
        description: "일상생활에 필요한 한국어",
        icon: "mdi-home",
        color: "#9C27B0",
        sortOrder: 4,
    },
    {
        name: "emergency",
        nameKo: "응급상황",
        nameEn: "Emergency",
        nameVi: "Khẩn cấp",
        description: "응급상황에서 사용하는 한국어",
        icon: "mdi-alert",
        color: "#F44336",
        sortOrder: 5,
    },
];

// 세부 카테고리 데이터
const subcategoriesData = {
    construction: [
        { name: "safety", nameKo: "안전", nameEn: "Safety", nameVi: "An toàn" },
        { name: "work_instruction", nameKo: "작업 지시", nameEn: "Work Instruction", nameVi: "Hướng dẫn công việc" },
        { name: "tools", nameKo: "도구", nameEn: "Tools", nameVi: "Công cụ" },
    ],
    manufacturing: [
        { name: "quality_control", nameKo: "품질 관리", nameEn: "Quality Control", nameVi: "Kiểm soát chất lượng" },
        { name: "machine_operation", nameKo: "기계 조작", nameEn: "Machine Operation", nameVi: "Vận hành máy móc" },
    ],
    service: [
        { name: "customer_service", nameKo: "고객 응대", nameEn: "Customer Service", nameVi: "Phục vụ khách hàng" },
        { name: "order_taking", nameKo: "주문 받기", nameEn: "Order Taking", nameVi: "Nhận đơn hàng" },
    ],
};

// 테스트 사용자 데이터
const testUsers = [
    {
        email: "test@example.com",
        password: "password123",
        name: "테스트 사용자",
        nationality: "Vietnam",
        nativeLanguage: "vi",
        occupationCategory: "manufacturing",
        koreanLevel: "beginner",
        currentLevel: null,
        levelTestCompleted: false,
    },
    {
        email: "advanced@example.com",
        password: "password123",
        name: "고급 사용자",
        nationality: "Vietnam",
        nativeLanguage: "vi",
        occupationCategory: "construction",
        koreanLevel: "advanced",
        currentLevel: 3,
        levelTestCompleted: true,
        levelTestScore: 16,
        levelTestDate: new Date(),
    },
];

// 메인 시드 함수
export const seedDatabase = async () => {
    try {
        console.log("🌱 Starting database seeding...");

        // 데이터베이스 연결 확인
        await sequelize.authenticate();
        console.log("✅ Database connection established");

        // 테이블 초기화 (개발 환경에서만)
        // 추후 필요하면 주석 제거해도돼 (대민)
        // if (process.env.NODE_ENV !== "production") {
        //   await sequelize.sync({ force: true });
        //   console.log("✅ Database synchronized");
        // }

        // 1. 카테고리 시딩
        console.log("\n📁 Seeding categories...");
        for (const catData of categoriesData) {
            const category = await Category.create(catData);
            console.log(`✅ Created category: ${category.nameKo}`);

            // 세부 카테고리 생성
            if (subcategoriesData[catData.name]) {
                for (const subData of subcategoriesData[catData.name]) {
                    await Subcategory.create({
                        ...subData,
                        categoryId: category.id,
                        sortOrder: subcategoriesData[catData.name].indexOf(subData) + 1,
                    });
                    console.log(`  ✅ Created subcategory: ${subData.nameKo}`);
                }
            }
        }

        // 2. 레벨테스트 문제 시딩
        console.log("\n📝 Seeding level test questions...");
        await seedLevelTestQuestions();

        // 3. 테스트 사용자 생성
        console.log("\n👤 Creating test users...");
        for (const userData of testUsers) {
            const user = await User.create(userData);
            console.log(`✅ Created user: ${user.email}`);
        }

        console.log("\n✅ Database seeding completed successfully!");
        console.log("\n📌 Test accounts:");
        console.log("  Email: test@example.com / Password: password123 (레벨테스트 미완료)");
        console.log("  Email: advanced@example.com / Password: password123 (레벨3 사용자)");

        return true;
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        return false;
    }
};

// 직접 실행 시
if (process.argv[1] === new URL(import.meta.url).pathname) {
    seedDatabase()
        .then(() => {
            console.log("✅ Seeding complete");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Seeding failed:", error);
            process.exit(1);
        });
}
