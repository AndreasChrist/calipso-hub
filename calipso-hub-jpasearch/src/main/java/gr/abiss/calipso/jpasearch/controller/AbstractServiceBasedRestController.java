/**
 *
 *
 * Copyright (c) 2007 - 2013 www.Abiss.gr
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package gr.abiss.calipso.jpasearch.controller;


import gr.abiss.calipso.ddd.core.model.dto.MetadatumDTO;
import gr.abiss.calipso.jpasearch.data.ParameterMapBackedPageRequest;
import gr.abiss.calipso.jpasearch.data.RestrictionBackedPageRequest;
import gr.abiss.calipso.jpasearch.model.FormSchema;
import gr.abiss.calipso.jpasearch.model.structuredquery.Restriction;
import gr.abiss.calipso.jpasearch.service.GenericService;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.resthub.common.exception.NotFoundException;
import org.resthub.web.controller.ServiceBasedRestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Persistable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Order;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

//@Controller
// @Transactional(readOnly = true)
// @RequestMapping(produces = { "application/json", "application/xml" })
public abstract class AbstractServiceBasedRestController<T extends Persistable<ID>, ID extends Serializable, S extends GenericService<T, ID>>
		extends
		ServiceBasedRestController<T, ID, S> {

	private static final Logger LOGGER = LoggerFactory.getLogger(AbstractServiceBasedRestController.class);
 
	@Autowired
	private HttpServletRequest request;

	public AbstractServiceBasedRestController() {
		super();
	}

	/**
	 * Find all resources matching the given criteria and return a paginated
	 * collection<br/>
	 * REST webservice published : GET
	 * /search?page=0&size=20&properties=sortPropertyName&direction=asc
	 * 
	 * @param page
	 *            Page number starting from 0 (default)
	 * @param size
	 *            Number of resources by pages. default to 10
	 * @return OK http status code if the request has been correctly processed,
	 *         with the a paginated collection of all resource enclosed in the
	 *         body.
	 */
	@Override
	@RequestMapping(method = RequestMethod.GET)
	@ResponseBody
	public Page<T> findPaginated(
			@RequestParam(value = "page", required = false, defaultValue = "1") Integer page,
			@RequestParam(value = "size", required = false, defaultValue = "10") Integer size,
			@RequestParam(value = "properties", required = false, defaultValue = "id") String sort,
			@RequestParam(value = "direction", required = false, defaultValue = "ASC") String direction) {

		Assert.isTrue(page > 0, "Page index must be greater than 0");

		Order order = new Order(
				direction.equalsIgnoreCase("ASC") ? Sort.Direction.ASC
						: Sort.Direction.DESC, sort);
		List<Order> orders = new ArrayList<Order>(1);
		orders.add(order);
		return this.service.findAll(
				new ParameterMapBackedPageRequest(request
				.getParameterMap(), page - 1, size, new Sort(orders)));
	}

	/**
	 * Find all resources matching the given criteria and return a paginated
	 * collection<br/>
	 * REST webservice published : GET
	 * /search?page=0&size=20&properties=sortPropertyName&direction=asc
	 * 
	 * @param restriction
	 *            the structured query as a Restriction instance
	 * @return OK http status code if the request has been correctly processed,
	 *         with the a paginated collection of all resource enclosed in the
	 *         body.
	 */
	@RequestMapping(value = "query", produces = { "application/json" }, method = RequestMethod.POST)
	@ResponseBody
	public Page<T> findPaginatedWithRestrictions(
			@RequestBody Restriction restriction) {

		return this.service.findAll(new RestrictionBackedPageRequest(restriction));
	}
    
	/**
	 * {@inheritDoc}
	 * 
	 * @Override
	 * @RequestMapping(method = RequestMethod.GET)
	 * @ResponseBody public Page<T> findPaginated(@RequestParam(value = "page",
	 *               required = false, defaultValue = "1") Integer page,
	 * @RequestParam(value = "size", required = false, defaultValue = "10")
	 *                     Integer size,
	 * @RequestParam(value = "direction", required = false, defaultValue =
	 *                     "ASC") String direction,
	 * @RequestParam(value = "properties", required = false, defaultValue =
	 *                     "id") String properties) {
	 * 
	 *                     Assert.isTrue(page > 0,
	 *                     "Page index must be greater than 0");
	 *                     Assert.isTrue(direction
	 *                     .equalsIgnoreCase(Sort.Direction.ASC.toString()) ||
	 *                     direction
	 *                     .equalsIgnoreCase(Sort.Direction.DESC.toString()),
	 *                     "Direction should be ASC or DESC");
	 *                     Assert.notNull(properties);
	 * 
	 *                     Page<T> resultPage = this.service .findAll(new
	 *                     ParameterMapBackedPageRequest( request
	 *                     .getParameterMap(), page - 1, size, new
	 *                     Sort(Sort.Direction
	 *                     .fromString(direction.toUpperCase()),
	 *                     properties.split(",")))); LOGGER.info("resultPage: "
	 *                     + resultPage.getClass()); return resultPage; }
	 */
	// TODO: refactor to OPTIONS on base path?
	@RequestMapping(value = "form-schema", produces = { "application/json" }, method = RequestMethod.GET)
	@ResponseBody
	public FormSchema getSchema(
			@RequestParam(value = "mode", required = false, defaultValue = "search") String mode) {
		Assert.isTrue(mode == null 
				|| mode.equalsIgnoreCase("SEARCH") 
				|| mode.equalsIgnoreCase("CREATE") 
				|| mode.equalsIgnoreCase("UPDATE"));
		mode = mode.toUpperCase();
		try {
			FormSchema schema = new FormSchema();
			schema.setDomainClass(
					((GenericService<Persistable<ID>, ID>) this.service)
							.getDomainClass());
			schema.setType(FormSchema.Type.valueOf(mode));
			return schema;
		} catch (Exception e) {
			throw new NotFoundException();
		}
	}

	@RequestMapping(produces = { "application/json" }, method = RequestMethod.OPTIONS)
	@ResponseBody
	public FormSchema getSchemas(
			@RequestParam(value = "mode", required = false, defaultValue = "search") String mode) {
		return this.getSchema(mode);
	}

	// @Secured("ROLE_ADMIN")
	@RequestMapping(value = "{subjectId}/metadata", method = RequestMethod.PUT)
	@ResponseBody
	public void addMetadatum(@PathVariable ID subjectId,
			@RequestBody MetadatumDTO dto) {
		service.addMetadatum(subjectId, dto);
	}

	// @Secured("ROLE_ADMIN")
	@RequestMapping(value = "{subjectId}/metadata/{predicate}", method = RequestMethod.DELETE)
	@ResponseBody
	public void removeMetadatum(@PathVariable ID subjectId,
			@PathVariable String predicate) {
		service.removeMetadatum(subjectId, predicate);
	}
}
