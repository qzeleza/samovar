#include "Tests.hpp"

class SamovarTest : public testing::Test {

protected:
    // Объявленные здесь члены класса могут использоваться всеми тестами в тестовом наборе

    std::stringstream output;
    std::streambuf* old_cout = nullptr;

    void capture_output() {
        old_cout = std::cout.rdbuf(output.rdbuf());
    }

    std::string get_captured_output() {
        std::string result = output.str();
        output.str("");
        return result;
    }
};

//namespace MyTests {
//
//    TEST_F(SamovarTest, DISABLED_SetupTest) {
//        char* args[] = {(char*)app_name.c_str(), (char*)"setup", nullptr};
//        int argc = 2;
//        EXPECT_EQ(CAMOBAP(argc, args), 0);
//    }
//
//    TEST_F(SamovarTest, StartTest) {
//        char* args[] = {(char*)app_name.c_str(), (char*)"start", nullptr};
//        int argc = 2;
//        EXPECT_EQ(CAMOBAP(argc, args), SERVER_ALREADY_RUN);
////                EXPECT_THAT(get_captured_output(), HasSubstr(zb("Запускаем API сервер...")));
//    }
//
//    TEST_F(SamovarTest, StopTest) {
//        char* args[] = {(char*)app_name.c_str(), (char*)"stop", nullptr};
//        int argc = 2;
//
////        CAMOBAP(argc, argst);
////        EXPECT_EQ(CAMOBAP(argc, argsp), SERVER_STOPPED);
//        EXPECT_EQ(CAMOBAP(argc, args), SERVER_NOT_RUNNING);
//    }
//
//    TEST_F(SamovarTest, InvalidTest) {
//        capture_output();
//        char* args[] = {(char*)app_name.c_str(), (char*)"", nullptr};
//        int argc = 2;
//        EXPECT_EQ(CAMOBAP(argc, args), TRIGGER_NOT_FOUND);
////                EXPECT_THAT(get_captured_output(), HasSubstr("Аргументы не заданы или не существуют."));
//    }
//
//}  // namespace

int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}