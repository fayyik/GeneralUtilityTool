export default {
    en: {
        "person.inviteData": ({ named }) =>
            `Already invited ${named(
                "friends"
            )} friends, Opportunity to receive additional rewards`,
        "detail.remain": ({ named }) => `Remaining ${named("days")} days`,
        "detail.discountOff": ({ named }) =>
            `${named("month")} MONTHS ${named("percent")}% OFF`,
        month: ({ named }) => `${named("count")} month`,
        months: ({ named }) => `${named("count")} months`,
        discountMomey: ({ named }) => `${named("discount")} Discount `,
        firstMonthRent: ({ named }) => `First Month Rent ${named("discount")}`,
        couponDiscount: ({ named }) => `${named("percent")} off `,
        freeMonth: ({ named }) => `Free ${named("discount")} months`,
        requiredMomey: ({ named }) => `${named("momey")}  required`,
        fullMonths: ({ named }) =>
            `available after ${named("count")}  full months`,
        "invoice.order": ({ named }) =>
            `${named("number")} orders have been selected, totaling ${named(
                "money"
            )} yuan`,
    },
    zhHans: {
        "person.inviteData": ({ named }) =>
            `已邀请 ${named("friends")} 名好友, 有机会获得额外奖励`, //获得 ${named('days')} 天免费租期!
        "detail.remain": ({ named }) => `租期：剩余${named("days")}天`,
        "detail.discountOff": ({ named }) =>
            `${named("month")}个月享${named("discount")}折`,
        month: ({ named }) => `${named("count")} 月`,
        months: ({ named }) => `${named("count")} 月`,
        discountMomey: ({ named }) => `优惠 ￥${named("discount")}  `,
        firstMonthRent: ({ named }) => `首月 ${named("discount")} 元`,
        couponDiscount: ({ named }) => ` 打 ${named("discount")} 折 `,
        freeMonth: ({ named }) => `免租 ${named("discount")} 个月`,
        requiredMomey: ({ named }) => `满￥${named("momey")} 可用`,
        fullMonths: ({ named }) => `满 ${named("count")} 个月可用`,
        "invoice.order": ({ named }) =>
            `已选 ${named("number")} 个订单，共 ${named("money")} 元`,
    }
};
