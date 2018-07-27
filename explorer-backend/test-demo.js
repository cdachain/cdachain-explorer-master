/* 

-- Table: public.parents

-- DROP TABLE public.parents;

CREATE TABLE public.parents
(
    pkid bigint NOT NULL DEFAULT nextval('parents_pkid_seq'::regclass),
    item text COLLATE pg_catalog."default" NOT NULL,
    parent text,
    CONSTRAINT pkid_pkey PRIMARY KEY (pkid)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.parents
    OWNER to postgres;

COMMENT ON COLUMN public.parents.item
    IS '元素';

COMMENT ON COLUMN public.parents.parent
    IS 'parent';






-- Table: public.transaction

-- DROP TABLE public.transaction;

CREATE TABLE public.transaction
(
    pkid bigint NOT NULL DEFAULT nextval('transaction_pkid_seq'::regclass),
    hash text COLLATE pg_catalog."default" NOT NULL,
    "from" text COLLATE pg_catalog."default",
    "to" text COLLATE pg_catalog."default",
    amount numeric,
    previous text COLLATE pg_catalog."default",
    witness_list_block text COLLATE pg_catalog."default",
    last_summary text COLLATE pg_catalog."default",
    last_summary_block text COLLATE pg_catalog."default",
    data text COLLATE pg_catalog."default",
    exec_timestamp bigint,
    signature text COLLATE pg_catalog."default",
    is_free boolean,
    level bigint,
    witnessed_level bigint,
    best_parent text COLLATE pg_catalog."default",
    is_stable boolean,
    is_fork boolean,
    is_invalid boolean,
    is_fail boolean,
    is_on_mc boolean,
    mci bigint,
    latest_included_mci bigint,
    mc_timestamp bigint,
    CONSTRAINT pkid_pkey PRIMARY KEY (pkid)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.transaction
    OWNER to postgres;

COMMENT ON COLUMN public.transaction.hash
    IS '交易号';

COMMENT ON COLUMN public.transaction."from"
    IS '发款方';

COMMENT ON COLUMN public.transaction."to"
    IS '收款方';

COMMENT ON COLUMN public.transaction.amount
    IS '余额，单位是Wei';

COMMENT ON COLUMN public.transaction.previous
    IS '上一个交易号';

COMMENT ON COLUMN public.transaction.witness_list_block
    IS '见证人列表Block';

COMMENT ON COLUMN public.transaction.last_summary
    IS 'last_summary';

COMMENT ON COLUMN public.transaction.last_summary_block
    IS 'last_summary_block';

COMMENT ON COLUMN public.transaction.data
    IS '数据';

COMMENT ON COLUMN public.transaction.exec_timestamp
    IS 'exec_timestamp';

COMMENT ON COLUMN public.transaction.signature
    IS '签名';

COMMENT ON COLUMN public.transaction.is_free
    IS 'is_free';

COMMENT ON COLUMN public.transaction.level
    IS 'level';

COMMENT ON COLUMN public.transaction.witnessed_level
    IS 'witnessed_level';

COMMENT ON COLUMN public.transaction.best_parent
    IS 'best_parent';

COMMENT ON COLUMN public.transaction.is_stable
    IS 'is_stable';

COMMENT ON COLUMN public.transaction.is_fork
    IS 'is_fork';

COMMENT ON COLUMN public.transaction.is_invalid
    IS 'is_invalid';

COMMENT ON COLUMN public.transaction.is_fail
    IS 'is_fail';

COMMENT ON COLUMN public.transaction.is_on_mc
    IS 'is_on_mc';

COMMENT ON COLUMN public.transaction.mci
    IS 'mci';

COMMENT ON COLUMN public.transaction.latest_included_mci
    IS 'latest_included_mci';

COMMENT ON COLUMN public.transaction.mc_timestamp
    IS 'mc_timestamp';

-- Index: hash_index

-- DROP INDEX public.hash_index;

CREATE UNIQUE INDEX hash_index
    ON public.transaction USING btree
    (hash COLLATE pg_catalog."default")
    TABLESPACE pg_default;



    
*/

/*
*





﻿czr_17wzm9qhbck8azs7w419i1o76rksasqqsit3z4e6qbufhfd4y5yjgbdbywy9
        - 1   100
        =  -101

﻿czr_1s4iqe7ztm7k9jmthaw67aucccxbns1cjzo1foq9jtp7mi5ukwwmocg91ukk
        + 100   0.1     0.0000000001    0.1     0.1111
        - 100.4111000001
        = -0.1

﻿czr_1u8wnf8pa3xuheuyfxxxa9139g645yx8qjhky8odgprs1urui7pyao5671xd
        - 10000

﻿czr_37yjefaq71dnb1g1ebj91fz1z8reaekf886enzp46iw3a41mph456iqkop11
        + 10000
        - 15    888.888888888888    888.888888888888    88.8888     88.88       99      5000        18888
        = -15957.546577777776
﻿czr_1acn7q7qshzn9yeof8act11zpdk7tyug7ao81csia5rakyb5wcs76jdft8sj
        = -27999
*
* */


// 查询是否有
var pgclient = require('./PG_ALL');// 引用上述文件
pgclient.getConnection();
pgclient.query("Select * FROM transaction  WHERE level = $1", [55], (data) => {
    console.log("level", data);
});

pgclient.query("Select * FROM parents  WHERE parent = $1", ["9037ACB079767390461E4EF8B2CEB0CEF588B7D01096DE46CBAAE89273AE5F7F"], (data) => {
    console.log("hash", data);
});