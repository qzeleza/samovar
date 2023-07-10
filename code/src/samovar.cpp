#ifndef SAMOVAR_API_HPP
#include "includes/api.hpp"
#endif
#ifndef SAMOVAR_SYSTEM_HPP
#include "includes/system.hpp"
#endif

int samovar() {

    const std::string domain = "samovar";
    const std::uint16_t port = 6621;

    ServerAPI api(port);
    initLocale(domain, ENGLISH);

    return static_cast<int>(api.start());
    
}
