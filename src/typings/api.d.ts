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
      roleName: string;
      /** role code */
      roleCode: string;
      /** role description */
      roleDesc: string;
    }>;

    /** role search params */
    type RoleSearchParams = Partial<
      Pick<Api.SystemManage.Role, 'roleName' | 'roleCode' | 'status'> & Common.CommonSearchParams
    >;

    /** role list */
    type RoleList = Common.PaginatingQueryRecord<Role>;

    /** all role */
    type AllRole = Pick<Role, 'id' | 'roleName' | 'roleCode'>;

    /**
     * user gender
     *
     * - "1": "male"
     * - "2": "female"
     */
    type UserGender = '1' | '2';

    /** user */
    type User = Common.CommonRecord<{
      /** user name */
      userName: string;
      /** user gender */
      userGender: UserGender;
      /** user nick name */
      nickName: string;
      /** user phone */
      userPhone: string;
      /** user email */
      userEmail: string;
      /** user role code collection */
      userRoles: string[];
    }>;

    /** user search params */
    type UserSearchParams = Partial<
      Pick<Api.SystemManage.User, 'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'status'> &
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
      op_cps_link_app_id: string;
      /** 领券链接分类id */
      op_cps_link_category_id: number | null;
      /** 备注 */
      op_cps_link_desc: string;
      /** 图标地址 */
      op_cps_link_icon_url: string;
      /** 链接名 */
      op_cps_link_name: string;
      /** 小程序原始ID */
      op_cps_link_original_id: string;
      /** 跳转链接 */
      op_cps_link_path: string;
      /** 排序 */
      op_cps_link_sort: number;
      /** 状态 0-正常 1-停用 */
      op_cps_link_status: number;
      /** 类型 0-普通链接 1-小程序 2-APP链接 */
      op_cps_link_type: number;
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
      op_cps_link_app_id: string;
      /** 领券链接分类id */
      op_cps_link_category_id: number;
      /** 备注 */
      op_cps_link_desc: string;
      /** 图标地址 */
      op_cps_link_icon_url: string;
      /** 链接名 */
      op_cps_link_name: string;
      /** 小程序原始ID */
      op_cps_link_original_id: string;
      /** 跳转链接 */
      op_cps_link_path: string;
      /** 排序 */
      op_cps_link_sort: number;
      /** 状态 0-正常 1-停用 */
      op_cps_link_status: number;
      /** 类型 0-普通链接 1-小程序 2-APP链接 */
      op_cps_link_type: number;
    }>;

    /** CouponLink list */
    type CouponLinkList = Common.PaginatingQueryRecord<CouponLink>;

    /** search params */
    type CouponLinkSearchParams = Partial<
      Pick<
        Api.CouponManage.EditCouponLink,
        | 'id'
        | 'type'
        | 'op_cps_link_category_id'
        | 'op_cps_link_app_id'
        | 'op_cps_link_original_id'
        | 'op_cps_link_name'
        | 'op_cps_link_status'
        | 'op_cps_link_path'
        | 'op_cps_link_sort'
        | 'op_cps_link_type'
        | 'op_cps_link_desc'
      > &
        Common.CommonSearchParams
    >;

    /** search params */
    type CouponLinkEditParams = Partial<
      Pick<
        Api.CouponManage.EditCouponLink,
        | 'id'
        | 'type'
        | 'op_cps_link_category_id'
        | 'op_cps_link_app_id'
        | 'op_cps_link_original_id'
        | 'op_cps_link_name'
        | 'op_cps_link_status'
        | 'op_cps_link_icon_url'
        | 'op_cps_link_path'
        | 'op_cps_link_sort'
        | 'op_cps_link_type'
        | 'op_cps_link_desc'
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
      op_cps_category_name: string;
      /** 状态 0-正常 1-停用 */
      op_cps_category_status: CouponLinkCategoryStatus;
      /** 描述 */
      op_cps_category_desc: string;
      /** 图标地址 */
      op_cps_category_icon_url: string;
    }>;

    type EditCouponLinkCategory = Common.CommonRecord<{
      current: number;
      page_size: number;
      /** 领券链接分类id */
      id: number;
      type: string;
      /** 分类名 */
      op_cps_category_name: string;
      /** 状态 0-正常 1-停用 */
      op_cps_category_status: number;
      /** 描述 */
      op_cps_category_desc: string;
      /** 图标地址 */
      op_cps_category_icon_url: string;
    }>;

    type CouponLinkCategoryList = Common.PaginatingQueryRecord<CouponLinkCategory>;

    type CouponLinkCategorySearchParams = Partial<
      Pick<
        Api.CouponManage.EditCouponLinkCategory,
        | 'id'
        | 'op_cps_category_name'
        | 'op_cps_category_status'
        | 'op_cps_category_desc'
        | 'type'
        | 'current'
        | 'page_size'
      > &
        Common.CommonSearchParams
    >;

    type CouponLinkCategoryEditParams = Partial<
      Pick<
        Api.CouponManage.EditCouponLinkCategory,
        | 'id'
        | 'op_cps_category_name'
        | 'op_cps_category_status'
        | 'op_cps_category_desc'
        | 'op_cps_category_icon_url'
        | 'type'
      > &
        Common.CommonSearchParams
    >;
    type CouponLinkCategoryStatus = '1' | '2'; // 1 正常 2 停用
  }

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

  /** 活码结构 */
  namespace LiveCode {
    type CompanyQrcodeList = {
      /** 今日新加客户数 */
      add_fans_num: number;
      /** 添加时间 */
      add_time: string;
      /** 关联成员详情 */
      associated_employee: AssociatedEmployee[];
      /** 渠道名称 */
      channel_name: string;
      /** 企业名称 */
      company_name: string;
      /** 活码Id */
      qrcode_id: number;
      /** 二维码地址 */
      qrcode_link: string;
      /** 标签 */
      tags: string;
    };

    /** AssociatedEmployee */
    export interface AssociatedEmployee {
      /** 当天已添加客户数 */
      employee_has_add: number;
      /** 成员Id */
      employee_id: number;
      /** 每日添加限制 */
      employee_limit_num: number;
      /** 成员名称 */
      employee_name: string;
      /** 当天状态 */
      employee_status: number;
    }

    type SearchParams = {
      /** 企业Id */
      company_id: number;
      /** 渠道名称 */
      channel_name: string;
      /** 当前页 */
      current: number;
      /** 每页大小 */
      page_size: number;
      [property: string]: any;
    };
  }

  /** 企业标签结构 */
  namespace CompanyTag {
    type CompanyTagList = {
      id: number;
      /** 标签名称 */
      tag_name?: string;
      /**
       * 企业名称
       */
      company_name: string;
      /**
       * 标签ID
       */
      fans_tags_id: string;
      /**
       * 父标签名称
       */
      father_name: string;
      /**
       * 标签名称
       */
      tags_name: string;
    };

    type SearchParams = {
      /** 企业自增id */
      company_id: number;
      /** 父标签ID */
      pid?: number;
      /** 当前页 */
      current: number;
      /** 每页大小 */
      page_size: number;
      [property: string]: any;
    };

    type TagTree = {
      id: number;
      /** 父标签ID */
      pid?: number;
      /** 标签名称 */
      name: string;
      /** 子标签 */
      children?: TagTree[];
    };
  }

  /** 企业员工结构 */
  namespace CompanyEmployee {
    type CompanyEmployeeList = {
      id: number;
      user_id: string;
      company_id: number;
      company_name: string;
      company_employee_name: string;
      company_employee_status: number;
      company_employee_gender: number;
      company_employee_avatar: string;
    };

    type SearchParams = {
      /** 企业自增id */
      company_id: number;
      /** 父标签ID */
      company_employee_name?: string;
      /** 员工状态 */
      employee_status?: number;
      /** 当前页 */
      current: number;
      /** 每页大小 */
      page_size: number;
      [property: string]: any;
    };
  }

  /** 企业附件结构 */
  namespace CompanyAttachment {
    type AddCompanyAttachment = {
      company_id: number;
      attachment_type: string;
      url: string;
      media_id:  string;
      create_at: number;
      bucket_file_name: string;
      link_url: string;
      title: string;
      description: string;
      mini_program_app_id: string;
      mini_program_title: string;
      mini_program_page_path: string;
      mini_program_child_title: string;
    };

    type AddCompanyAttachmentResponse = {
      attachment_id: number;
      attachment_type: string;
    };

    // 上传图片消息接口响应
    type AddCompanyAttachmentImageResponse = {
      url: string;
    }

    // 上传附件接口响应
    type UploadCompanyAttachmentResponse = {
      type: string;
      media_id: string;
      created_at: number;
    }

  }
}
