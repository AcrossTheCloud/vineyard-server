-- Users table
CREATE SEQUENCE public.users_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;

CREATE TABLE public.users
(
  id bigint NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  username character varying,
  password character varying,
  editor boolean,
  admin boolean,
  CONSTRAINT users_id_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE users IS 'Authorised users';
COMMENT ON COLUMN users.id IS '{bigint} [Primary Key] Unique ID for row';
COMMENT ON COLUMN users.username IS '{character varying} Username of user account';
COMMENT ON COLUMN users.password IS '{character varying} Password PBKDF2 delimited string';
COMMENT ON COLUMN users.editor IS '{boolean} If true this user can change flooded states';
COMMENT ON COLUMN users.admin IS '{boolean} If true this user can manage user accounts';

CREATE INDEX users_username_index
  ON public.users
  USING btree
  (username COLLATE pg_catalog."default");

COMMENT ON INDEX users_username_index IS 'Index for looking up users by username';

-- Bootstrap default user
INSERT INTO users
	(username, password, editor, admin)
	VALUES ('demo', 'xUJZbu+Sj2WD::j/Dem/dpIh/lqgtFROAVfS78n48uD4EbRjEKMm2V::30::10000', true, false);
