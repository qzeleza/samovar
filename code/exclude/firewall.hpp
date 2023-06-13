//
// Created by master on 07.02.2023.
//

#ifndef SAMOVAR_FIREWALL_HPP
#define SAMOVAR_FIREWALL_HPP
#ifndef SAMOVAR_LOCALE_HPP
#include "../include/locale.hpp"
#endif

#include <iostream>
#include <string>
#include <ipq.h>

template <typename T>
class Iptable {
    private:
        ipq rule_;
        std::string protocol_;
        std::string match_;
        std::string target_;
        std::string mark_;
        bool ipv6_;

    public:
        Iptable(std::string rule, std::string protocol, std::string match, std::string target, std::string mark, bool ipv6 = false) {
            rule_.set_rule(rule);
            protocol_ = protocol;
            match_ = match;
            target_ = target;
            mark_ = mark;
            ipv6_ = ipv6;
        }

        void addRule() {
            rule_.add_protocol(protocol_);
            rule_.add_match(match_);
            rule_.add_target(target_, mark_);
            if (ipv6_) {
                rule_.add_ipv6();
            }
        }
};

#endif //SAMOVAR_FIREWALL_HPP
