//
// Created by Жезл on 17.03.2023.
//
#include "Tests.hpp"

class LocaleTest : public testing::Test {

    // Если конструктора и деструктора недостаточно для установки
    // и очистки каждого теста, вы можете определить следующие методы:

    void SetUp() override {
        // Код здесь будет вызываться сразу после конструктора (прямо
        // перед каждым тестом).
    }

    void TearDown() override {
        // Код здесь будет вызываться сразу после каждого теста (прямо
        // перед деструктором).
    }

    // Объявленные здесь члены класса могут использоваться всеми тестами в тестовом наборе

};

namespace MyTests {

    TEST_F(LocaleTest, InitLocale) {
        const std::string domain = "test";
        initLocale(domain, ENGLISH);
        EXPECT_STREQ(textdomain(nullptr), domain.c_str());
        initLocale(domain, RUSSIAN);
        EXPECT_STREQ(textdomain(nullptr), domain.c_str());
    }

    // Тест на успешную установку русского языка
    TEST_F(LocaleTest, TestSetLocaleRussian) {
        EXPECT_TRUE(setLocale(RUSSIAN));
    }

    // Тест на успешную установку английского языка
    TEST_F(LocaleTest, TestSetLocaleEnglish) {
        EXPECT_TRUE(setLocale(ENGLISH));
    }

    // Тест на проверку корректности установленной локали
    TEST_F(LocaleTest, TestSetLocaleCurrentLocale) {
        setLocale(RUSSIAN);
        const char* current_locale = setlocale(LC_ALL, nullptr);
        EXPECT_TRUE(strstr(current_locale, "ru_RU") != nullptr);
    }

}