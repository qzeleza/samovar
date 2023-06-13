//
// Created by master on 20.03.2023.
//

#include "Tests.hpp"
#include <chrono> // для использования функции sleep_for
#include <thread> // для использования функции sleep_for
#include <sys/stat.h> // для использования функции chmod

class PrintMessageTest : public testing::Test {

protected:

    void SetUp() override {
    }

    void TearDown() override {
    }

};

namespace MyTests {


    TEST_F(PrintMessageTest, BasicUsage) {
        // Тестирование базового использования функции printMessage
        std::string format_string = "Hello %s!";
        std::string name = "World";
        ASSERT_EQ(printMessage(format_string, name), "Hello World!");
    }

    TEST_F(PrintMessageTest, MultipleArguments) {
        // Тестирование использования функции printMessage с несколькими аргументами
        std::string format_string = "%s + %s = %s";
        int num1 = 1;
        int num2 = 2;
        int sum = num1 + num2;
        ASSERT_EQ(printMessage(format_string, num1, num2, sum), "1 + 2 = 3");
    }

    TEST_F(PrintMessageTest, InvalidArgument) {
        EXPECT_THROW(
            printMessage("Hello %s %s", "world"),
            std::invalid_argument
        );
    }

    TEST_F(PrintMessageTest, InsufficientArguments) {
        // Тестирование использования функции printMessage с недостаточным количеством аргументов
        std::string format_string = "%s + %s = %s";
        int num1 = 1;
        ASSERT_THROW(printMessage(format_string, num1), std::invalid_argument);
    }

}
