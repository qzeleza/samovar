## Файл манифеста для CPP
# SPDX-License-Identifier: WTFPL
include $(TOPDIR)/rules.mk
PKG_NAME:=samovar
PKG_VERSION:=0.1
PKG_RELEASE:=
#PKG_FIXUP:=autoreconf
#PKG_LICENSE:=WTFPL
#PKG_LICENSE_FILES:=LICENSE.txt
PKG_BUILD_DEPENDS:=libmicrohttpd
#lboost_filesystem lboost_system
#lboost_thread
include $(INCLUDE_DIR)/package.mk
define Package/samovar
	CATEGORY:=RESTful API
	SUBMENU:=Kvas
	TITLE:=RESTful API для поддрежания WUI для утилиты Квас.
	SECTION:=utils
	URL:=https://github.com/qzeleza/samovar
  	DEPENDS:=+libmicrohttpd +libstdcpp +nginx +libintl-full
  	#+boost-filesystem
endef

define Package/samovar/description
	Самовар это RESTful API для поддрежания WUI для утилиты Квас.
	Детали можно найти в документации: https://github.com/qzeleza/samovar/wiki/
endef

FILE_NAME:=libhttpserver
FILE_VERSION:=0.18.2
FILE_SOURCE:=$(FILE_NAME)-$(FILE_VERSION).tar.gz
define Download/libhttpserver
  FILE:=$(FILE_SOURCE)
  URL:=https://codeload.github.com/etr/libhttpserver/tar.gz/refs/tags/$(FILE_VERSION)?
  HASH:=1dfe548ac2add77fcb6c05bd00222c55650ffd02b209f4e3f133a6e3eb29c89d
endef

$(eval $(call Download,libhttpserver))
define Build/Prepare
	$(call Build/Prepare/Default)
	$(HOST_TAR) -xzf $(DL_DIR)/$(FILE_SOURCE) -C $(PKG_BUILD_DIR)
	( cd $(PKG_BUILD_DIR)/$(FILE_NAME)-$(FILE_VERSION); \
		$(MAKE) -f Makefile.cvs; \
	)
endef

define Build/Configure
	( cd $(PKG_BUILD_DIR)/$(FILE_NAME)-$(FILE_VERSION); \
		./configure \
		--disable-doxygen-doc \
		--disable-examples \
		--disable-static \
		--enable-same-directory-build \
		$(CONFIGURE_ARGS); \
	)
endef

TARGET_CXXFLAGS += -I./opt/include -Wall
#TARGET_CXXFLAGS += $(if $(CONFIG_mips),-fgnu89-inline)
TARGET_LDFLAGS += -L./opt/lib -lhttpserver -lmicrohttpd -lstdc++
#-lboost_filesystem -lboost_system # на mips не хочет запускать пакет boost
#-lboost_thread
define Build/Compile
	$(MAKE) -C $(PKG_BUILD_DIR)/$(FILE_NAME)-$(FILE_VERSION) \
		DESTDIR="$(PKG_BUILD_DIR)" install
	( cd $(PKG_BUILD_DIR); \
		$(TARGET_CXX) $(TARGET_CPPFLAGS) $(TARGET_CXXFLAGS) \
		-o samovar *.cpp includes/*.hpp $(TARGET_LDFLAGS); \
	)
endef

#
#define Package/CAMOBAP/conffiles
#	/opt/etc/nginx/conf.d/wui.conf
#endef
SOURCE_OPT_PATH=/apps/entware/package/master/samovar/files/opt
define Package/samovar/install
	$(INSTALL_DIR) $(1)/opt/sbin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/samovar $(1)/opt/sbin/samovar
	$(INSTALL_DIR) $(1)/opt/etc/init.d
	$(INSTALL_BIN) $(SOURCE_OPT_PATH)/etc/init.d/S96samovar $(1)/opt/etc/init.d
	$(INSTALL_DIR) $(1)/opt/lib
	$(CP) $(PKG_BUILD_DIR)/opt/lib/libhttpserver.so.* $(1)/opt/lib
#	$(CP) $(STAGING_DIR)/opt/lib/libboost_system.so.* $(1)/opt/lib
#	$(CP) $(STAGING_DIR)/opt/lib/libboost_filesystem.so.* $(1)/opt/lib
#	$(CP) $(STAGING_DIR)/opt/lib/libboost_atomic.so.* $(1)/opt/lib
	$(INSTALL_DIR) $(1)/opt/var/www
	$(CP) $(SOURCE_OPT_PATH)/var/www $(1)/opt/var/
	$(INSTALL_DIR) $(1)/opt/etc/nginx/conf.d
	$(CP) /apps/entware/package/master/samovar/files/opt/etc/nginx/conf.d/wui.conf $(1)/opt/etc/nginx/conf.d
	$(CP) /apps/entware/package/master/samovar/files/opt/etc/nginx/conf.d/nginx.conf.set $(1)/opt/etc/nginx/
endef

define Package/samovar/postinst
#!/bin/sh
user=nginx
[ "$$(id -g "$${user}")" ] || addgroup "$${user}"
[ "$$(id -u "$${user}")" ] || adduser -H -D -G $${user} -s /bin/sh "$${user}"
chown -R "$${user}":"$${user}" /opt/var/www/ /opt/var/log/nginx/ /opt/var/run/nginx
mkdir -p /opt/var/log/nginx /opt/var/run/nginx
grep -q 'user nobody;' /opt/etc/nginx/nginx.conf && mv /opt/etc/nginx/nginx.conf /opt/etc/nginx/nginx.conf.orig
[ -f /opt/etc/nginx/nginx.conf.set ] && mv -f /opt/etc/nginx/nginx.conf.set /opt/etc/nginx/nginx.conf &>/dev/null
sed -i "s/^\(user.\)*;$//\1 $${user}/" /opt/etc/nginx/nginx.conf
kill -9 $$(pgrep samovar) &>/dev/null &&  echo 'Самовар удален из памяти успешно!'
/opt/etc/init.d/S80nginx test && {
	/opt/etc/init.d/S80nginx stop || kill -9 $$(pgrep nginx)
	rm /opt/var/log/nginx/error.log
	/opt/etc/init.d/S80nginx start
	[ $$? = 1 ] || {
		echo 'При запуске nginx возникли проблемы!'
		/opt/etc/init.d/S80nginx test
		cat /opt/var/log/nginx/error.log | head -10
	}
}
/opt/etc/init.d/S96samovar restart
#/opt/etc/init.d/S96samovar start
#/opt/etc/init.d/S96samovar status
endef

define Package/samovar/postrm
#!/bin/sh
rm -rf /opt/var/www
grep -q 'user nobody;' /opt/etc/nginx/nginx.conf.orig && mv /opt/etc/nginx/nginx.conf.orig /opt/etc/nginx/nginx.conf
endef

$(eval $(call BuildPackage,samovar))
