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
      role_name: string;
      router_ids: string;
      button_ids: string;
      /** role description */
      role_desc: string;
    }>;

    /** role search params */
    type RoleSearchParams = Partial<
      Pick<Api.SystemManage.Role, 'role_name'> & Common.CommonSearchParams
    >;

    /** role list */
    type RoleList = Common.PaginatingQueryRecord<Role>;

    /** all role */
    type AllRole = Pick<Role, 'id' | 'role_name'>;


    /** user */
    type User = Common.CommonRecord<{
      /** user name */
      id: number;
      username: string;
      status: number; // 1 正常 2 停用
      /** user role code collection */
      userRoles: string[];
    }>;

    /** user search params */
    type UserSearchParams = Partial<
      Pick<Api.SystemManage.User, 'type' | 'username' | 'status'> &
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
    type MenuType = '1' | '2';

    type MenuButton = {
      /**
       * button code
       *
       * it can be used to control the button permission
       */
      code: string;
      /** button description */
      desc: string;
    };

    /**
     * icon type
     *
     * - "1": iconify icon
     * - "2": local icon
     */
    type IconType = '1' | '2';

    type MenuPropsOfRoute = Pick<
      import('vue-router').RouteMeta,
      | 'i18nKey'
      | 'keepAlive'
      | 'constant'
      | 'order'
      | 'href'
      | 'hideInMenu'
      | 'activeMenu'
      | 'multiTab'
      | 'fixedIndexInTab'
      | 'query'
    >;

    type Menu = Common.CommonRecord<{
      /** parent menu id */
      parentId: number;
      /** menu type */
      menuType: MenuType;
      /** menu name */
      menuName: string;
      /** route name */
      routeName: string;
      /** route path */
      routePath: string;
      /** component */
      component?: string;
      /** iconify icon name or local icon name */
      icon: string;
      /** icon type */
      iconType: IconType;
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
}
