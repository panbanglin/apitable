/**
 * APITable <https://github.com/apitable/apitable>
 * Copyright (C) 2022 APITable Ltd. <https://apitable.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { useMount } from 'ahooks';
import axios from 'axios';
import { ShortcutActionManager, ShortcutActionName } from 'modules/shared/shortcut_key';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AutoTestID, Events, Player, StoreActions } from '@apitable/core';
import Trash from 'pc/components/trash/trash';
import { useCatalogTreeRequest, usePageParams, useQuery, useRequest } from 'pc/hooks';
import { useAppSelector } from 'pc/store/react-redux';
import { ComponentDisplay, ScreenSize } from '../common/component_display';
import WorkspaceRoute from '../route_manager/workspace_route';
import styles from './style.module.less';

/**
 * StandaloneView component - 简洁的独立视图，适用于嵌入第三方网站
 * 提供没有导航侧边栏的干净界面
 */
export const StandaloneView: React.FC<React.PropsWithChildren<unknown>> = () => {
  const dispatch = useDispatch();
  const userSpaceId = useAppSelector((state) => state.user.info!.spaceId);
  const { getTreeDataReq } = useCatalogTreeRequest();
  const { run: getTreeData } = useRequest(getTreeDataReq, { manual: true });
  const router = useRouter();
  usePageParams();
  const query = useQuery();

  useMount(() => {
    // 不要调用resumeUserHistory，防止跳转
    dispatch(StoreActions.setTreeLoading(true));
    Player.doTrigger(Events.datasheet_shown);
  });

  useMount(() => {
    const notifyId = query.get('notifyId');
    if (notifyId) {
      // 从通知进入，则标记通知为已读
      // Api.transferNoticeToRead([notifyId]);
    }
  });

  // 绑定/解绑快捷键
  useEffect(() => {
    const eventBundle = new Map([
      [
        ShortcutActionName.ToggleCatalogPanel,
        () => {
          // 不执行任何操作，因为我们没有侧边栏
        },
      ],
    ]);

    eventBundle.forEach((cb, key) => {
      ShortcutActionManager.bind(key, cb);
    });

    return () => {
      eventBundle.forEach((_cb, key) => {
        ShortcutActionManager.unbind(key);
      });
    };
  });

  useEffect(() => {
    if (userSpaceId) {
      dispatch(StoreActions.initCatalogTree());
      getTreeData();
    }
    // eslint-disable-next-line
  }, [userSpaceId, dispatch]);

  const children = router.asPath.includes('trash') ? <Trash /> : <WorkspaceRoute />;

  return (
    <div
      id={AutoTestID.WORKBENCH_PAGE}
      className={styles.standaloneWrapper}
    >
      <ComponentDisplay minWidthCompatible={ScreenSize.md}>
        <div className={styles.standaloneContent}>
          {children}
        </div>
      </ComponentDisplay>

      <ComponentDisplay maxWidthCompatible={ScreenSize.md}>
        <div className={styles.standaloneContent}>
          {children}
        </div>
      </ComponentDisplay>
    </div>
  );
}; 