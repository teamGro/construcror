if (document.querySelector('.interview-create__constructor')) {
  let xCenter = window.innerWidth / 2;
  const state = {
    idGroup: 1,
    idConnector: 1,
  };

  const consts = {
    rectSettings: {
      x: 0,
      y: 0,
      fill: 'green',
      width: 150,
      height: 70,
      cornerRadius: 10,
    },
    textSettings: {
      x: 0,
      y: 0,
      fontSize: 20,
      fontFamily: 'Calibri',
      fill: 'black',
      padding: 10,
      align: 'center',
      width: 150,
    },
    groupSettings: {
      x: xCenter - 150 / 2,
      y: 50,
      width: 150,
      height: 90,
      draggable: true,
      id: state.idGroup,
      parentId: null,
      childrensId: [],
    },
    offset: 50,
    circlePositions: ['top', 'right', 'bottom', 'left'],
    subMenuIds: {
      main: 'subMenu',
      show: 'show',
      change: 'change',
      remove: 'remove',
      add: 'add',
    },
    textId: 'text-el',
    rectId: 'rect-el',
  };

  const stage = new Konva.Stage({
    container: 'constructor',
    width: 5000,
    height: 3000,
  });

  const layer = new Konva.Layer();

  let points = null;
  let connector = null;
  let coordsDiff = null;
  let clickCounter = null;
  let currentTitle = null;

  const btnStart = document.querySelector('#constructorStart');
  btnStart.addEventListener('click', () => {
    let title = prompt('Введите название блока', 'test');
    if (!title?.trim()) return;
    const group = createGroup({ text: title });
    layer.add(group);

    addGroupHandlers(group);
    btnStart.disabled = true;
  });

  stage.add(layer);

  let circleCenter = new Konva.Circle({
    x: window.innerWidth / 2,
    y: (window.innerHeight - 320) / 2,
    radius: 10,
    fill: 'magenta',
    opacity: 0,
    id: 'circleCenter',
  });

  layer.add(circleCenter);

  let scale = 1;
  let zoomStep = 0.1;
  const container = document.querySelector('.constructor__container');
  const decreaseBtn = document.querySelector('.constructor__btn--decrease');
  const increaseBtn = document.querySelector('.constructor__btn--increase');

  decreaseBtn.addEventListener('click', () => {
    scale -= zoomStep;
    container.style.transform = `scale(${scale})`;
    if (scale < 0.6) {
      decreaseBtn.disabled = true;
      return;
    }

    increaseBtn.disabled = false;
  });

  increaseBtn.addEventListener('click', () => {
    scale += zoomStep;
    container.style.transform = `scale(${scale})`;

    if (scale >= 1.5) {
      increaseBtn.disabled = true;
      return;
    }
    decreaseBtn.disabled = false;
  });

  function createGroup(params, isPosition = true) {
    const id = `group-${state.idGroup}`;
    const group = new Konva.Group({
      ...consts.groupSettings,
      ...params,
      id,
      stroke: 'black',
      strokeWidth: 2,
    });

    if (params?.parentId) {
      const parent = layer
        .getChildren()
        .find((item) => item.attrs.id === params.parentId).attrs;
      // позиционируем дочерние элементы отосительно родителя
      if (parent.childrensId.length && isPosition) {
        const lastChildren = layer
          .getChildren()
          .find(
            (el) =>
              el.attrs.id === parent.childrensId[parent.childrensId.length - 1],
          ).attrs;

        if (parent.childrensId.length === 1) {
          group.setAttr(
            'x',
            lastChildren.x - lastChildren.width - consts.offset,
          );
        } else {
          const preLast = layer
            .getChildren()
            .find(
              (el) =>
                el.attrs.id ===
                parent.childrensId[parent.childrensId.length - 2],
            ).attrs;
          if (parent.childrensId.length % 2 === 0) {
            group.setAttr('x', preLast.x + preLast.width + consts.offset);
          } else {
            group.setAttr('x', preLast.x - preLast.width - consts.offset);
          }

          group.setAttr('y', lastChildren.y);
        }
      }
      parent.childrensId.push(id);
    }

    const mainRect = createMainRect();
    group.add(mainRect);
    const text = createText({ text: params.text });
    group.add(text);

    for (let i = 0; i < consts.circlePositions.length; i++) {
      const circle = createCircle(group, consts.circlePositions[i]);
      group.add(circle);
      addCircleHandler(circle, group.attrs);
    }
    const subMenu = createSubMenu();
    group.add(subMenu);
    addSubMenuHandlers(group);
    state.idGroup++;

    return group;
  }

  function createMainRect() {
    return new Konva.Rect({
      ...consts.rectSettings,
      x: 0,
      y: 0,
      id: consts.rectId,
    });
  }

  function createText(options) {
    return new Konva.Text({
      ...consts.textSettings,
      text: options.text,
      id: consts.textId,
    });
  }

  function createCircle(options, position) {
    const circle = new Konva.Circle({
      radius: 10,
      fill: 'red',
      opacity: 0,
      id: position,
    });

    let rect = options
      .getChildren()
      .find((el) => el.attrs.id === consts.rectId)
      .getClientRect({ skipTransform: false });

    switch (position) {
      case 'top':
        circle.setAttrs({ x: rect.width / 2, y: 0 });
        break;
      case 'right':
        circle.setAttrs({ x: rect.width, y: rect.height / 2 });
        break;
      case 'bottom':
        circle.setAttrs({
          x: rect.width / 2,
          y: rect.height,
        });
        break;
      case 'left':
        circle.setAttrs({ x: 0, y: rect.height / 2 });
    }

    return circle;
  }

  function createSubMenu() {
    const group = new Konva.Group({
      x: 80,
      y: 80,
      width: 100,
      height: 20,
      opacity: 0,
      id: consts.subMenuIds.main,
    });

    const showTitle = new Konva.Text({
      x: 0,
      y: 0,
      text: 'st',
      fontSize: 20,
      fill: 'black',
      fontFamily: 'Calibri',
      id: consts.subMenuIds.show,
    });
    group.add(showTitle);

    const changeTitle = new Konva.Text({
      x: 20,
      y: 0,
      text: 'ct',
      fontSize: 20,
      fill: 'black',
      fontFamily: 'Calibri',
      id: consts.subMenuIds.change,
    });
    group.add(changeTitle);

    const removeBlock = new Konva.Text({
      x: 40,
      y: 0,
      text: 'rb',
      fontSize: 20,
      fill: 'black',
      fontFamily: 'Calibri',
      id: consts.subMenuIds.remove,
    });
    group.add(removeBlock);

    const addBlock = new Konva.Text({
      x: 60,
      y: 0,
      text: 'ab',
      fontSize: 20,
      fill: 'black',
      fontFamily: 'Calibri',
      id: consts.subMenuIds.add,
    });
    group.add(addBlock);

    return group;
  }

  function showOrHideGroupElements(group, isVisible) {
    const childrens = group.getChildren();
    if (isVisible) {
      childrens.forEach((item) => {
        if (consts.circlePositions.includes(item.attrs.id)) {
          item.setAttr('opacity', 1);
        }
      });
    } else {
      childrens.forEach((item) => {
        if (consts.circlePositions.includes(item.attrs.id)) {
          item.setAttr('opacity', 0);
        }
      });
    }
  }

  function toggleSubMenuOpacity(group) {
    let subMenu = group
      .getChildren()
      .find((item) => item.attrs.id === consts.subMenuIds.main);
    const subMenuVisibility = subMenu.attrs.opacity;
    subMenu.setAttr('opacity', subMenuVisibility === 1 ? 0 : 1);
  }

  function addGroupHandlers(group) {
    group.addEventListener('click', () => {
      toggleSubMenuOpacity(group);
    });

    group.addEventListener('mousemove', () => {
      showOrHideGroupElements(group, true);
    });

    group.addEventListener('mouseout', () => {
      showOrHideGroupElements(group);
    });

    group.addEventListener('dragmove', () => {
      updateConnectorsPosition(group);
    });
  }

  function addSubMenuHandlers(group) {
    let subMenu = group
      .getChildren()
      .filter((item) => item.attrs.id === consts.subMenuIds.main)[0];
    let childrens = subMenu.getChildren();
    childrens.forEach((item) => {
      if (item.attrs.id === consts.subMenuIds.show) {
        item.addEventListener('click', () => {
          alert(group.attrs.text);
        });
      } else if (item.attrs.id === consts.subMenuIds.change) {
        item.addEventListener('click', () => {
          const title = prompt('введите название');
          if (!title.trim()) return;
          group
            .getChildren()
            .find((el) => el.attrs.id === consts.textId)
            .setAttr('text', title);
        });
      } else if (item.attrs.id === consts.subMenuIds.remove) {
        item.addEventListener('click', () => {
          removeGroup(group);
        });
      } else if (item.attrs.id === consts.subMenuIds.add) {
        item.addEventListener('click', () => {
          let title = prompt('введите название', state.idGroup);
          if (!title?.trim()) return;
          let options = {
            ...group.attrs,
            parentId: group.attrs.id,
            childrensId: [],
            y: group.attrs.y + 150,
            text: title,
          };
          const newGroup = createGroup(options);
          layer.add(newGroup);
          addGroupHandlers(newGroup);
          addConnectors(newGroup.attrs);
        });
      }
    });
  }

  function addConnectors(options) {
    const id = `connector-${state.idConnector}`;
    const parent = layer
      .getChildren()
      .find((item) => item.attrs.id === options.parentId);
    const from = parent.attrs.id;
    const to = options.id;
    let rect = parent
      .getChildren()
      .find((el) => el.attrs.id === consts.rectId)
      .getClientRect({ skipTransform: false });
    const points = [
      rect.x + rect.width / 2,
      rect.y + rect.height,
      options.x + options.width / 2,
      options.y,
    ];

    let arrow = new Konva.Arrow({
      from,
      to,
      points,
      id,
      fill: 'black',
      stroke: 'black',
      strokeWidth: 2,
    });
    state.idConnector++;
    layer.add(arrow);
  }

  function updateConnectorsPosition(options) {
    const group = options
      .getChildren()
      .find((el) => el.attrs.id === consts.rectId)
      .getClientRect({ skipTransform: false });

    let connectors = layer
      .getChildren()
      .filter((el) => el.attrs.id.includes('connector'));

    if (!connectors?.length) return;

    connectors.forEach((conn) => {
      let item = conn.attrs;
      let children = options.attrs.childrensId?.find((el) => el === item.to);
      let parent = options.attrs.parentId;

      if (item.from === options.attrs.id) {
        if (children) {
          children = layer
            .getChildren()
            .find((el) => el.attrs.id === children)
            .getChildren()
            .find((el) => el.attrs.id === consts.rectId)
            .getClientRect({ skipTransform: false });

          if (
            group.y < children.y + consts.offset &&
            group.x > children.x + consts.groupSettings.width
          ) {
            item.points = [
              group.x,
              group.y + group.height / 2,
              children.x + children.width,
              children.y + children.height / 2,
            ];
          } else if (
            group.y < children.y + consts.offset &&
            group.x + consts.groupSettings.width < children.x
          ) {
            item.points = [
              group.x + group.width / 2,
              group.y + group.height,
              children.x,
              children.y + children.height / 2,
            ];
          } else {
            item.points = [
              group.x + group.width / 2,
              group.y + group.height,
              children.x + children.width / 2,
              children.y,
            ];
          }
        }
      }
      if (item.to === options.attrs.id) {
        if (parent) {
          parent = layer.getChildren().find((el) => el.attrs.id === parent);
          let parentCoords = parent
            .getChildren()
            .find((el) => el.attrs.id === consts.rectId)
            .getClientRect({ skipTransform: false });

          if (
            group.y - consts.groupSettings.height < parentCoords.y &&
            group.x < parentCoords.x - consts.groupSettings.width
          ) {
            item.points = [
              parentCoords.x,
              parentCoords.y + parentCoords.height / 2,
              group.x + group.width,
              group.y + group.height / 2,
            ];
          } else if (
            group.y - consts.groupSettings.height < parentCoords.y &&
            group.x > parentCoords.x - consts.groupSettings.width
          ) {
            item.points = [
              parentCoords.x + parentCoords.width,
              parentCoords.y + parentCoords.height / 2,
              group.x,
              group.y + group.height / 2,
            ];
          } else {
            item.points = [
              parentCoords.x + parentCoords.width / 2,
              parentCoords.y + parentCoords.height,
              group.x + group.width / 2,
              group.y,
            ];
          }
        }
      }
      conn.points(item.points);
    });
    layer.batchDraw();
  }

  function removeGroup(group) {
    const groupAttrs = group.attrs;
    let connectors = layer
      .getChildren()
      .filter((el) => el.attrs.id.includes('connector'));
    let removedConnectors = null;

    // если у удаляемого элемента есть родитель, удаляем в родителе ссылку на удаляемый элемент
    if (groupAttrs.parentId) {
      removedConnectors = connectors.filter((item) => {
        return (
          item.attrs.from === groupAttrs.parentId &&
          item.attrs.to === groupAttrs.id
        );
      });

      if (removedConnectors?.length) {
        removedConnectors.forEach((item) => {
          layer
            .getChildren()
            .find((el) => el.attrs.id === item.attrs.id)
            .destroy();
        });
      }

      let parent = layer
        .getChildren()
        .find((el) => el.attrs.id === groupAttrs.parentId);

      parent.attrs.childrensId = parent.attrs.childrensId.filter(
        (item) => item !== groupAttrs.id,
      );
    }
    // если у удаляемого элемента есть дочерние элементы, удяляем ссылки у дочерних элементов на родительский
    if (groupAttrs.childrensId?.length) {
      removedConnectors = connectors.filter((item) => {
        return (
          item.attrs.from === groupAttrs.id &&
          groupAttrs.childrensId.includes(item.attrs.to)
        );
      });

      if (removedConnectors?.length) {
        removedConnectors.forEach((item) => {
          layer
            .getChildren()
            .find((el) => el.attrs.id === item.attrs.id)
            .destroy();
        });
      }

      groupAttrs.childrensId.forEach((item) => {
        layer.getChildren().find((el) => el.attrs.id === item).attrs.parentId =
          null;
      });
    }
    group.destroy();
  }

  function addCircleHandler(circle, group) {
    circle.addEventListener('click', (e) => {
      const circlePosition = circle.absolutePosition();
      points = [circlePosition.x, circlePosition.y];
      coordsDiff = [e.clientX - circlePosition.x, e.clientY - circlePosition.y];
      connector = new Konva.Arrow({
        from: group.id,
        to: null,
        points,
        id: `connector-${state.idConnector}`,
        fill: 'black',
        stroke: 'black',
        strokeWidth: 2,
      });
      state.idConnector++;
      layer.add(connector);
      stage.addEventListener('mousemove', drawArrow);

      currentTitle = prompt('введите название', state.idGroup);
      clickCounter = 0;

      stage.addEventListener('click', addGroupThrowCircle);
    });
  }

  function drawArrow(e) {
    points[2] = e.clientX - coordsDiff[0];
    points[3] = e.clientY - coordsDiff[1];
    connector.points(points);
  }

  function addGroupThrowCircle() {
    if (clickCounter === 1) {
      let xCoord = points[2];
      let yCoord = points[3] - consts.groupSettings.height / 2;
      let parent = layer
        .getChildren()
        .find((el) => el.attrs.id === connector.attrs.from).attrs;
      if (parent.x > points[2]) {
        xCoord = points[2] - consts.groupSettings.width;
      }
      if (parent.y + consts.groupSettings.height < points[3]) {
        yCoord = points[3];
        xCoord = points[2] - consts.groupSettings.width / 2;
      }
      const group = createGroup(
        {
          text: currentTitle,
          childrensId: [],
          x: xCoord,
          y: yCoord,
          parentId: parent.id,
        },
        false,
      );
      layer.add(group);
      addGroupHandlers(group);
      connector.setAttr('to', group.attrs.id);
      stage.removeEventListener('mousemove', drawArrow);
      stage.removeEventListener('click', addGroupThrowCircle);
      clickCounter = null;
      currentTitle = null;
      return;
    }
    clickCounter++;
  }

  function zoomStage(stage, zoomPoint, zoomBefore, inc) {
    let oldScale = stage.scaleX();

    var mousePointTo = {
      x: (zoomPoint.x - stage.x()) / oldScale,
      y: (zoomPoint.y - stage.y()) / oldScale,
    };

    let zoomAfter = zoomBefore + inc;
    stage.scale({ x: zoomAfter, y: zoomAfter });

    var newPos = {
      x: zoomPoint.x - mousePointTo.x * zoomAfter,
      y: zoomPoint.y - mousePointTo.y * zoomAfter,
    };

    stage.position(newPos);
    layer.draw();

    return zoomAfter;
  }
}
