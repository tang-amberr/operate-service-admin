/**
 * Namespace Api
 *
 * All backend api type
 */
declare namespace Api {
  namespace Common {
    /** common params of paginating */
    interface PaginatingCommonParams {
      /** current page number */
      current: number;
      /** page size */
      page_size: number;
      request_page_size: number;
      /** total count */
      total: number;
    }

    /** common params of paginating query list data */
    interface PaginatingQueryRecord<T = any> extends PaginatingCommonParams {
      list: T[];
    }

    /** common search params of table */
    type CommonSearchParams = Pick<Common.PaginatingCommonParams, 'current' | 'page_size'>;

    /**
     * enable status
     *
     * - "1": enabled
     * - "2": disabled
     */
    type EnableStatus = '1' | '2';

    /** common record */
    type CommonRecord<T = any> = {
      /** record id */
      id: number;
      /** record creator */
      createBy: string;
      /** record create time */
      createTime: string;
      /** record updater */
      updateBy: string;
      /** record update time */
      updateTime: string;
      /** record status */
      status: EnableStatus;
    } & T;
  }

  /**
   * Namespace Auth
   *
   * Backend api module: "auth"
   */
  namespace Auth {
    interface LoginToken {
      token: string;
      refreshToken: string;
    }

    interface UserInfo {
      userId: string;
      userName: string;
      roles: string[];
      buttons: string[];
    }
  }

  /**
   * Namespace Route
   *
   * Backend api module: "route"
   */
  namespace Route {
    type ElegantConstRoute = import('@elegant-router/types').ElegantConstRoute;

    interface MenuRoute extends ElegantConstRoute {
      id: string;
    }

    interface UserRoute {
      routes: MenuRoute[];
      home: import('@elegant-router/types').LastLevelRouteKey;
    }
  }

  /**
   * namespace SystemManage
   *
   * backend api module: "systemManage"
   */
  namespace SystemManage {
    /** role */
    type Role = Common.CommonRecord<{
      /** role name */
      id: number;
      admin_role_name: string;
      admin_role_router_ids: number[];
      admin_role_button_ids: number[];
      /** role description */
      admin_role_desc: string;
    }>;

    /** edit role */
    type EditAdminRole = Common.CommonRecord<{
      /** role name */
      id: number;
      admin_role_name?: string;
      admin_role_router_ids?:number[];
      admin_role_button_ids?: number[];
      /** role description */
      admin_role_desc?: string;
      type: string
    }>;

    /** role search params */
    type RoleSearchParams = Partial<
      Pick<Api.SystemManage.Role, 'admin_role_name'> & Common.CommonSearchParams
    >;

    /** role list */
    type RoleList = Common.PaginatingQueryRecord<Role>;

    /** all role */
    type AllRole = Pick<Role, 'id' | 'admin_role_name'>;

    /** admin button */
    type AdminButton = Common.CommonRecord<{
      id: number;
      key: string;
      title: string;
      status: number;
    }>;

    type AdminButtonList = Common.PaginatingQueryRecord<AdminButton>;

    /** button search params */
    type ButtonSearchParams = Partial<
      Pick<Api.SystemManage.AdminButton, 'key' | 'title' | 'status'> & Common.CommonSearchParams
    >;

    /** edit admin button */
    type EditAdminButton = Common.CommonRecord<{
      id: number;
      key: string;
      type: string;
      title: string;
      status: number;
    }>;



    /** user */
    type User = Common.CommonRecord<{
      /** user name */
      id: number;
      admin_user_username: string;
      admin_user_status: number; // 1 正常 2 停用
      /** user role code collection */
      user_roles: Role[];
    }>;

    /** edit user */
    type EditUser = Common.CommonRecord<{
      /** user name */
      id: number;
      type: string;
      admin_user_username: string;
      admin_user_status: number; // 1 正常 2 停用
      /** user role code collection */
      user_roles: Role[];
      admin_user_role_ids: number[];
    }>;

    /** user search params */
    type UserSearchParams = Partial<
      Pick<Api.SystemManage.User, 'type' | 'admin_user_username' | 'admin_user_status'> &
      Common.CommonSearchParams
    >;

    /** user list */
    type UserList = Common.PaginatingQueryRecord<User>;

    /**
     * menu type
     *
     * - "1": directory
     * - "2": menu
     */
    type MenuType = 1 | 2 | 3;

    type MenuButton = {
      /**
       * button code
       *
       * it can be used to control the button permission
       */
      key: string;
      /** button description */
      title: string;
    };

    /**
     * icon type
     *
     * - "1": iconify icon
     * - "2": local icon
     */
    type IconType = 1 | 2;

    type MenuPropsOfRoute = Pick<
      import('vue-router').RouteMeta,
      | 'i18n_key'
      | 'keep_alive'
      | 'constant'
      | 'order'
      | 'href'
      | 'hide_in_menu'
      | 'active_menu'
      | 'multi_tab'
      | 'fixed_index_in_tab'
      | 'query'
    >;

    type Menu = Common.CommonRecord<{
      /** parent menu id */
      admin_router_pid: number;
      /** menu type */
      admin_router_menu_type: MenuType;
      /** menu name */
      admin_router_menu_name: string;
      /** route name */
      admin_router_route_name: string;
      /** route path */
      admin_router_route_path: string;
      /** component */
      admin_router_component?: string;
      /** iconify icon name or local icon name */
      admin_router_icon: string;
      /** icon type */
      admin_router_icon_type: IconType;
      /** buttons */
      buttons?: MenuButton[] | null;
      /** children menu */
      children?: Menu[];
    }> &
      MenuPropsOfRoute;

    /** menu list */
    type MenuList = Common.PaginatingQueryRecord<Menu>;

    type MenuTree = {
      id: number;
      label: string;
      pId: number;
      children?: MenuTree[];
    };

    type EditMenuRequest = {
      id?: number;
      menuType: MenuType;
      menuName: string;
      routeName: string;
      routePath: string;
      component?: string;
      i18nKey?: App.I18n.I18nKey | null;
      icon: string;
      iconType: IconType;
      parentId: number;
      status: number;
      keepAlive?: number | null;
      constant?: number;
      order?: number | null;
      href?: string | null;
      hideInMenu?: number | null;
      activeMenu?: import('@elegant-router/types').RouteKey | null;
      multiTab?: number | null;
      fixedIndexInTab?: number | null;
      query?: { key: string; value: string }[] | null;
      buttons?: MenuButton[] | null;
    };
  }
  /**
   * namespace CouponManage
   *
   * backend api module: "CouponManage"
   */
  namespace CouponManage {
    type CouponLinkStatus = '1' | '2'; // 1 正常 2 停用

    type CouponLinkType = '1' | '2' | '3'; // 1 普通链接 2 小程序 3 APP链接

    /** CouponLnk */
    type CouponLink = Common.CommonRecord<{
      /** 创建时间 */
      create_at: string;
      /** 领券链接id */
      id: number;
      /** 小程序appid */
      cps_link_app_id: string;
      /** 领券链接分类id */
      cps_link_category_id: number|null;
      /** 备注 */
      cps_link_desc: string;
      /** 图标地址 */
      cps_link_icon_url: string;
      /** 链接名 */
      cps_link_name: string;
      /** 小程序原始ID */
      cps_link_original_id: string;
      /** 跳转链接 */
      cps_link_path: string;
      /** 排序 */
      cps_link_sort: number;
      /** 状态 0-正常 1-停用 */
      cps_link_status: number;
      /** 类型 0-普通链接 1-小程序 2-APP链接 */
      cps_link_type: number;
      /** 修改时间 */
      update_at: string;
    }>;

    /** CouponLnk */
    type EditCouponLink = Common.CommonRecord<{
      current: number;
      page_size: number;
      /** 领券链接id */
      id: number;
      type: string;
      /** 小程序appid */
      cps_link_app_id: string;
      /** 领券链接分类id */
      cps_link_category_id: number;
      /** 备注 */
      cps_link_desc: string;
      /** 图标地址 */
      cps_link_icon_url: string;
      /** 链接名 */
      cps_link_name: string;
      /** 小程序原始ID */
      cps_link_original_id: string;
      /** 跳转链接 */
      cps_link_path: string;
      /** 排序 */
      cps_link_sort: number;
      /** 状态 0-正常 1-停用 */
      cps_link_status: number;
      /** 类型 0-普通链接 1-小程序 2-APP链接 */
      cps_link_type: number;
    }>;

    /** CouponLink list */
    type CouponLinkList = Common.PaginatingQueryRecord<CouponLink>;

    /** search params */
    type CouponLinkSearchParams = Partial<
      Pick<
        Api.CouponManage.EditCouponLink,
        | 'cps_link_category_id'
        | 'cps_link_app_id'
        | 'cps_link_name'
        | 'cps_link_status'
        | 'cps_link_type'
      > &
        Common.CommonSearchParams
    >;

    /** search params */
    type CouponLinkEditParams = Partial<
      Pick<
        Api.CouponManage.EditCouponLink,
        | 'id'
        | 'type'
        | 'cps_link_category_id'
        | 'cps_link_app_id'
        | 'cps_link_original_id'
        | 'cps_link_name'
        | 'cps_link_status'
        | 'cps_link_icon_url'
        | 'cps_link_path'
        | 'cps_link_sort'
        | 'cps_link_type'
        | 'cps_link_desc'
      > &
      Common.CommonSearchParams
    >;

    type CouponLinkCategory = Common.CommonRecord<{
      /** 创建时间 */
      create_at: string;
      /** 修改时间 */
      update_at: string;
      /** 领券链接分类id */
      id: number;
      /** 分类名 */
      cps_category_name: string;
      /** 状态 0-正常 1-停用 */
      cps_category_status: CouponLinkCategoryStatus;
      /** 描述 */
      cps_category_desc: string;
      /** 图标地址 */
      cps_category_icon_url: string;
    }>;

    type EditCouponLinkCategory = Common.CommonRecord<{
      current: number;
      page_size: number;
      /** 领券链接分类id */
      id: number;
      type: string;
      /** 分类名 */
      cps_category_name: string;
      /** 状态 0-正常 1-停用 */
      cps_category_status: number;
      /** 描述 */
      cps_category_desc: string;
      /** 图标地址 */
      cps_category_icon_url: string;
    }>;

    type CouponLinkCategoryList = Common.PaginatingQueryRecord<CouponLinkCategory>;

    type CouponLinkCategorySearchParams = Partial<
      Pick<
        Api.CouponManage.EditCouponLinkCategory,
        | 'id'
        | 'cps_category_name'
        | 'cps_category_status'
        | 'current'
        | 'page_size'
      > &
        Common.CommonSearchParams
    >;

    type CouponLinkCategoryEditParams = Partial<
      Pick<
        Api.CouponManage.EditCouponLinkCategory,
        | 'id'
        | 'cps_category_name'
        | 'cps_category_status'
        | 'cps_category_desc'
        | 'cps_category_icon_url'
        | 'type'
      > &
        Common.CommonSearchParams
    >;
    type CouponLinkCategoryStatus = '1' | '2'; // 1 正常 2 停用
  }

  /**
   * 企微粉丝
   */
  namespace WechatFans {
    type WechatFansList = {
      company_fans_id: number;
      company_fans_name: string;
      company_fans_profile_picture: string;
      company_fans_external_user_id: string;
      company_belong_id: string;
      company_fans_status: number;
      company_fans_bind_type: number;
      company_fans_loss_at: string;
      company_fans_last_active_time: string;
    };

    type SearchParams = {
      company_type: number;
      /** 当前页 */
      current: number;
      /** 每页大小 */
      page_size: number;
      [property: string]: any;
    };
  }

  /**
   *
   * 粉丝分析（流失。。。）
   */
  namespace FansAnalysis {
    type FansAnalysis = {
      company_valid_fans: number;
      company_accumulated_loss: number;
      company_accomulated_enter: number;
    };

    type SearchParams = {
      company_id: string;
    };
  }

  /**
   *
   * 企业管理
   */
  namespace WechatEnterprise {
    type WechatEnterpriseList = {
      id: number;
      company_name: string;
      company_corp_id: string; // 企业标识
      company_type: string;
      company_status: string;
      company_remarks: string;
      company_seats_numbers: string;
      company_agent_id: string;
      company_create_at: string;
      company_update_at: string;
    };

    type SearchParams = {
      /** 当前页 */
      current: number;
      /** 每页大小 */
      page_size: number;
      [property: string]: any;
    };
  }

  /**
   * 企业成员
   */
  namespace EnterpriseMember {
    type EnterpriseMemberList = {
      company_member_user_account: string;
      company_member_account_type: number;
      company_member_scope_of_authority: string;
      company_member_user_name: string;
      company_member_operate: string;
    };

    type SearchParams = {
      company_id: number;
      /** 当前页 */
      current: number;
      /** 每页大小 */
      page_size: number;
      [property: string]: any;
    };
  }

  /**
   * 成员管理
   */
  namespace MemberManage {
    type MemberManageParam = {
      company_id: number;
      type: string;
      user_account: string;
      user_name: string;
      account_type: number;
      authorization_label: string;
    };

    type SearchParams = {
      company_id: number;
      /** 当前页 */
      current: number;
      /** 每页大小 */
      page_size: number;
      [property: string]: any;
    };
  }

  /**
   * 公司管理
   */
  namespace CompanyManage {
    type CompanyAddParam = {
      company_name: string;
      company_type: number;
      company_status: number;
      company_remarks: string;
      company_seats_numbers: number;
      company_corp_id: string;
      company_agent_id: string;
    };

    type SearchParams = {
      /** 当前页 */
      current: number;
      /** 每页大小 */
      page_size: number;
      [property: string]: any;
    };
  }
}
