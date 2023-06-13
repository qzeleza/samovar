////
//// Created by master on 07.02.2023.
////
//
//#include "exclude/firewall.hpp"
//
//int setIptables() {
//    Iptable<std::string> vredir_tcp("VREDIR", "tcp", "--tcp-flags FIN,SYN,RST,ACK SYN", "MARK", "--set-xmark 0xd1000/0xffffffff", false);
//    Iptable<std::string> vredir_udp("VREDIR", "udp", "--conntrack --ctstate NEW", "MARK", "--set-xmark 0xd1000/0xffffffff", false);
//    Iptable<std::string> connmark("VREDIR", "", "", "CONNMARK", "--save-mark --nfmask 0xffffffff --ctmask 0xffffffff", false);
//    Iptable<std::string> vredir_tcp6("VREDIR", "tcp", "--tcp-flags FIN,SYN,RST,ACK SYN", "MARK", "--set-xmark 0xd1000/0xffffffff", true);
//    Iptable<std::string> vredir_udp6("VREDIR", "udp", "--conntrack --ctstate NEW", "MARK", "--set-xmark 0xd1000/0xffffffff", true);
//    Iptable<std::string> connmark6("VREDIR", "", "", "CONNMARK", "--save-mark --nfmask 0xffffffff --ctmask 0xffffffff", true);
//
//    vredir_tcp.addRule();
//    vredir_udp.addRule();
//    connmark.addRule();
//    vredir_tcp6.addRule();
//    vredir_udp6.addRule();
//    connmark6.addRule();
//
//    return 0;
//}
