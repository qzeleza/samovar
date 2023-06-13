# Файл манифеста для BASH
include $(TOPDIR)/rules.mk

PKG_NAME:=@APP_NAME
PKG_VERSION:=@PACKAGE_VERSION-@PACKAGE_STAGE
PKG_RELEASE:=@PACKAGE_RELEASE
#PKG_RELEASE:=$(AUTORELEASE)
PKG_MAINTAINER:=@AUTHOR <@EMAIL>
PKG_LICENSE:=@LICENCE

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/@APP_NAME
	CATEGORY:=@CATEGORY
	SUBMENU:=@SUBMENU
	TITLE:=@TITLE
	SECTION:=utils
	URL:=@GITHUB
	DEPENDS:=
	PKGARCH:=all
endef

define Package/@APP_NAME/description
	@DESCRIPTION
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	cp -rf @CODE_DIR/. $(PKG_BUILD_DIR)
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/@APP_NAME/install
	$(INSTALL_DIR) $(1)/opt/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/@APP_NAME $(1)/opt/bin/
	$(INSTALL_DIR) $(1)@APP_ROUTER_DIR

	$(CP) ./files/. $(1)@APP_ROUTER_DIR
endef

@INSTALL

@PREINST

@POSTINST

@PRERM

@POSTRM

$(eval $(call BuildPackage,@APP_NAME))
